import { normalizeContent } from '@/core/universal-learning-engine/extraction/services/normalizeContent'
import { logger } from '@/lib/logger'

export type ExtractYouTubeTranscriptResult = { success: true; title: string; content: string } | { success: false; error: string }

const FETCH_TIMEOUT_MS = 15_000
const MIN_TRANSCRIPT_CHARS = 50

// Supports every shape a user would realistically paste: the standard
// watch URL, a shortened youtu.be link, a Shorts URL, and a bare embed
// URL. A YouTube video ID is always exactly 11 URL-safe characters.
const YOUTUBE_ID_PATTERN = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function extractYouTubeVideoId(rawUrl: string): string | null {
  return rawUrl.match(YOUTUBE_ID_PATTERN)?.[1] ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// The watch page embeds its own player state as `var ytInitialPlayerResponse
// = {...huge JSON...};` — a plain regex can't reliably find the matching
// closing brace (the JSON itself is full of nested `{}` and string values
// that can contain `};`), so this walks the string by hand, tracking
// brace depth and skipping over quoted-string contents (including escaped
// quotes), the same way a real JSON tokenizer would.
function extractBalancedJsonAfter(source: string, marker: string): string | null {
  const markerIndex = source.indexOf(marker)
  if (markerIndex === -1) return null
  const braceStart = source.indexOf('{', markerIndex)
  if (braceStart === -1) return null

  let depth = 0
  let inString = false
  let isEscaped = false
  for (let i = braceStart; i < source.length; i++) {
    const char = source[i]
    if (inString) {
      if (isEscaped) isEscaped = false
      else if (char === '\\') isEscaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) return source.slice(braceStart, i + 1)
    }
  }
  return null
}

function getVideoTitle(playerResponse: unknown): string | null {
  if (!isRecord(playerResponse)) return null
  const videoDetails = playerResponse.videoDetails
  if (!isRecord(videoDetails) || typeof videoDetails.title !== 'string') return null
  return videoDetails.title
}

type CaptionTrack = { baseUrl: string; languageCode: string | null }

function getCaptionTracks(playerResponse: unknown): readonly CaptionTrack[] {
  if (!isRecord(playerResponse)) return []
  const captions = playerResponse.captions
  if (!isRecord(captions)) return []
  const renderer = captions.playerCaptionsTracklistRenderer
  if (!isRecord(renderer)) return []
  const tracks = renderer.captionTracks
  if (!Array.isArray(tracks)) return []

  const result: CaptionTrack[] = []
  for (const track of tracks) {
    if (isRecord(track) && typeof track.baseUrl === 'string') {
      result.push({ baseUrl: track.baseUrl, languageCode: typeof track.languageCode === 'string' ? track.languageCode : null })
    }
  }
  return result
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
}

// YouTube Transcript Import™ — there is no YouTube Data API key
// configured in this app (see src/config/reviewsPlaylist.ts's own
// comment), so this reads the same public caption-track data the watch
// page itself already loads to feed its own player — the same
// undocumented approach every transcript-fetching tool without an API
// key uses. Honestly disclosed as fragile — and, as of this writing,
// confirmed genuinely broken for most real videos: YouTube's timedtext
// endpoint now requires a Proof-of-Origin token from a real browser
// session (BotGuard attestation) and returns an HTTP 200 with a silently
// EMPTY body otherwise — verified directly, with matching cookies and
// Referer/Origin headers forwarded, still empty. This isn't a bug in the
// parsing logic below (video ID extraction, caption-track discovery, and
// JSON parsing all work correctly); it's YouTube's own 2025-era
// anti-scraping change, affecting every unofficial transcript tool, not
// something a plain server-side fetch can work around. Left in place as
// an honest best-effort — see the empty-body check below, which reports
// this distinctly and honestly rather than silently failing or
// fabricating a transcript — ready to work again if that changes,
// without needing new code.
export async function extractYouTubeTranscript(rawUrl: string): Promise<ExtractYouTubeTranscriptResult> {
  const videoId = extractYouTubeVideoId(rawUrl)
  if (!videoId) {
    return { success: false, error: "That doesn't look like a YouTube video link." }
  }

  let watchPageHtml: string
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept-Language': 'en-US,en;q=0.9' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) {
      return { success: false, error: 'This YouTube video could not be reached.' }
    }
    watchPageHtml = await response.text()
  } catch (error) {
    logger.warn('[UrlImport] YouTube watch page fetch failed', { videoId, error: error instanceof Error ? error.message : String(error) })
    return { success: false, error: 'We could not reach this YouTube video. Please check the link and try again.' }
  }

  const playerResponseJson = extractBalancedJsonAfter(watchPageHtml, 'ytInitialPlayerResponse')
  if (!playerResponseJson) {
    return { success: false, error: "We could not read this video's details. It may be private or unavailable." }
  }

  let playerResponse: unknown
  try {
    playerResponse = JSON.parse(playerResponseJson)
  } catch {
    return { success: false, error: "We could not read this video's details." }
  }

  const videoTitle = getVideoTitle(playerResponse) ?? 'YouTube Video'
  const captionTracks = getCaptionTracks(playerResponse)
  if (captionTracks.length === 0) {
    return { success: false, error: 'This video does not have captions or a transcript available.' }
  }

  // Prefer an English track (manual or auto-generated) when one exists;
  // otherwise fall back to whatever the first available track is — some
  // real transcript is more honest and useful than refusing outright.
  const track = captionTracks.find((candidate) => candidate.languageCode?.startsWith('en')) ?? captionTracks[0]!

  try {
    const transcriptResponse = await fetch(track.baseUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!transcriptResponse.ok) {
      return { success: false, error: "We could not download this video's transcript." }
    }
    const transcriptXml = await transcriptResponse.text()

    // YouTube Anti-Scraping™ — as of 2025, YouTube's timedtext endpoint
    // can return an HTTP 200 with a completely EMPTY body (no XML, no
    // error) when the request lacks a valid Proof-of-Origin token, which
    // only a real browser session (via YouTube's own BotGuard
    // attestation) can produce — confirmed directly: identical requests
    // with matching cookies/Referer/Origin headers still come back
    // empty. This is a genuinely different failure than "this video's
    // transcript happens to be short," so it gets its own honest
    // message rather than falling into the length check below.
    if (transcriptXml.trim().length === 0) {
      logger.warn('[UrlImport] YouTube timedtext endpoint returned an empty body (likely blocked)', { videoId })
      return {
        success: false,
        error: "We couldn't retrieve captions for this video right now — YouTube is blocking automated caption requests. Please try again later, or paste a web article link instead.",
      }
    }

    const segments = [...transcriptXml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((match) => decodeHtmlEntities(match[1]!).trim())
    const transcriptText = segments.filter(Boolean).join(' ')

    if (transcriptText.length < MIN_TRANSCRIPT_CHARS) {
      return { success: false, error: "This video's transcript is too short to summarize." }
    }

    const { content } = normalizeContent(transcriptText)
    return { success: true, title: videoTitle, content }
  } catch (error) {
    logger.warn('[UrlImport] YouTube transcript fetch failed', { videoId, error: error instanceof Error ? error.message : String(error) })
    return { success: false, error: "We could not download this video's transcript." }
  }
}
