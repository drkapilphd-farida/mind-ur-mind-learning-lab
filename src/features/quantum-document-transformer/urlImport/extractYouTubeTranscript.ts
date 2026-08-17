import { normalizeContent } from '@/core/universal-learning-engine/extraction/services/normalizeContent'
import { logger } from '@/lib/logger'

// `source` is load-bearing, not decorative — importQuantumDocumentFromUrl.ts
// persists it as `is_metadata_only_summary`, which the document viewer uses
// to permanently disclose thinner source material and hide anything that
// tests factual recall (Quiz, Recall Questions, Feynman Challenge) against
// content that was never actually verified against a real transcript.
export type ExtractYouTubeContentResult =
  | { success: true; title: string; content: string; source: 'transcript' | 'metadata' }
  | { success: false; error: string }

const FETCH_TIMEOUT_MS = 15_000
const MIN_TRANSCRIPT_CHARS = 50
// A real video description can honestly be a single short line — this
// only guards against the genuinely-empty case (no description at all),
// not against brevity itself.
const MIN_METADATA_CHARS = 20

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

// The video's own real description, exactly as YouTube stores it — never
// expanded, paraphrased, or embellished. This is what the metadata-only
// fallback below sends to Claude instead of a transcript: genuine
// YouTube data, just thinner than a full transcript.
function getVideoDescription(playerResponse: unknown): string | null {
  if (!isRecord(playerResponse)) return null
  const videoDetails = playerResponse.videoDetails
  if (!isRecord(videoDetails) || typeof videoDetails.shortDescription !== 'string') return null
  return videoDetails.shortDescription
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

// Attempts a real transcript fetch — returns the transcript text, or null
// if none could be retrieved for any reason (no captions, blocked
// endpoint, too short). Never throws; every failure path is honestly
// reported via a logger.warn and a null return, letting the caller fall
// back to metadata rather than surfacing a hard error for what is, in
// practice, now the common case.
async function tryFetchTranscript(videoId: string, captionTracks: readonly CaptionTrack[]): Promise<string | null> {
  if (captionTracks.length === 0) return null

  // Prefer an English track (manual or auto-generated) when one exists;
  // otherwise fall back to whatever the first available track is — some
  // real transcript is more honest and useful than refusing outright.
  const track = captionTracks.find((candidate) => candidate.languageCode?.startsWith('en')) ?? captionTracks[0]!

  try {
    const transcriptResponse = await fetch(track.baseUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!transcriptResponse.ok) return null
    const transcriptXml = await transcriptResponse.text()

    // YouTube Anti-Scraping™ — as of 2025, YouTube's timedtext endpoint
    // can return an HTTP 200 with a completely EMPTY body (no XML, no
    // error) when the request lacks a valid Proof-of-Origin token, which
    // only a real browser session (via YouTube's own BotGuard
    // attestation) can produce — confirmed directly: identical requests
    // with matching cookies/Referer/Origin headers still come back
    // empty. This is now the common case, not an edge case, which is
    // exactly why this function falls back to real metadata instead of
    // just failing outright.
    if (transcriptXml.trim().length === 0) {
      logger.warn('[UrlImport] YouTube timedtext endpoint returned an empty body (likely blocked)', { videoId })
      return null
    }

    const segments = [...transcriptXml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((match) => decodeHtmlEntities(match[1]!).trim())
    const transcriptText = segments.filter(Boolean).join(' ')
    return transcriptText.length >= MIN_TRANSCRIPT_CHARS ? transcriptText : null
  } catch (error) {
    logger.warn('[UrlImport] YouTube transcript fetch failed', { videoId, error: error instanceof Error ? error.message : String(error) })
    return null
  }
}

// YouTube Content Import™ — there is no YouTube Data API key configured
// in this app (see src/config/reviewsPlaylist.ts's own comment), so this
// reads the same public caption-track data the watch page itself already
// loads to feed its own player — the same undocumented approach every
// transcript-fetching tool without an API key uses. Honestly disclosed as
// fragile, and, as of this writing, confirmed genuinely broken for MOST
// real videos (see tryFetchTranscript's own comment on why). Rather than
// failing outright for the common case, this now falls back to the
// video's own real title + description — genuine YouTube metadata,
// never invented or "expanded upon" — and reports that honestly via
// `source: 'metadata'` so the caller can disclose it and skip generating
// anything that tests factual recall against unverified content.
export async function extractYouTubeContent(rawUrl: string): Promise<ExtractYouTubeContentResult> {
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

  const transcriptText = await tryFetchTranscript(videoId, captionTracks)
  if (transcriptText !== null) {
    const { content } = normalizeContent(transcriptText)
    return { success: true, title: videoTitle, content, source: 'transcript' }
  }

  // Honest Metadata Fallback™ — real YouTube data (this video's own
  // title + description, verbatim), just less of it than a transcript.
  // Deliberately NOT sent to Claude with any instruction to "expand" or
  // infer beyond what's actually here — the AI prompt this feeds into
  // (QUANTUM_DOCUMENT_TRANSFORMER_SYSTEM_PROMPT) summarizes whatever real
  // text it receives honestly, the same way it already handles a short
  // uploaded note; a thin summary of thin real material is correct
  // behavior, not a bug to prompt around.
  const description = getVideoDescription(playerResponse)
  const metadataText = [videoTitle, description].filter((part): part is string => typeof part === 'string' && part.trim().length > 0).join('\n\n')

  if (metadataText.trim().length < MIN_METADATA_CHARS) {
    return {
      success: false,
      error: "We couldn't retrieve this video's transcript or description. Please try again later, or paste a web article link instead.",
    }
  }

  const { content } = normalizeContent(metadataText)
  return { success: true, title: videoTitle, content, source: 'metadata' }
}
