import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'
import { normalizeContent } from '@/core/universal-learning-engine/extraction/services/normalizeContent'
import { logger } from '@/lib/logger'

export type ExtractWebsiteContentResult = { success: true; title: string; content: string } | { success: false; error: string }

const FETCH_TIMEOUT_MS = 15_000
// A generous cap for a single article page — large enough for any real
// page, small enough that a pathological response can't tie up this
// request indefinitely or blow past the AI call's own MAX_PROMPT_CHARS
// budget (generateQuantumDocumentIntelligence.ts truncates from here
// anyway, so this is about request cost/latency, not correctness).
const MAX_HTML_CHARS = 3_000_000
// Below this, Readability's own extraction is too thin to be worth an
// AI call — almost certainly a paywall/login wall/JS-only page, not a
// real article, so this is reported honestly rather than sent to Claude
// as if it were real content.
const MIN_ARTICLE_CHARS = 200

const REQUEST_HEADERS: Record<string, string> = {
  // Many sites block requests with no User-Agent (or an obviously
  // non-browser one) outright — a real, honest browser-like UA is what
  // keeps this working the same way a person's own browser would.
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
}

function parseHttpUrl(candidate: string): URL | null {
  try {
    const url = new URL(candidate.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

// Article Link Import™ — fetches a pasted web URL server-side and runs
// the exact same reader-view extraction algorithm Firefox's own Reader
// Mode uses (Mozilla's Readability, over a lightweight linkedom DOM —
// no headless browser, no JS execution, so pages that render their
// article body only via client-side JS won't extract well; an honest,
// disclosed limitation shared by every non-browser-based scraper).
export async function extractWebsiteContent(rawUrl: string): Promise<ExtractWebsiteContentResult> {
  const url = parseHttpUrl(rawUrl)
  if (!url) {
    return { success: false, error: 'Please paste a valid web link, starting with http:// or https://.' }
  }

  let html: string
  try {
    const response = await fetch(url.toString(), {
      headers: REQUEST_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) {
      return { success: false, error: `This link returned an error (${response.status}) and could not be read.` }
    }
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) {
      return { success: false, error: 'This link does not point to a readable web page.' }
    }
    html = await response.text()
    if (html.length > MAX_HTML_CHARS) html = html.slice(0, MAX_HTML_CHARS)
  } catch (error) {
    logger.warn('[UrlImport] Website fetch failed', { url: url.toString(), error: error instanceof Error ? error.message : String(error) })
    return { success: false, error: 'We could not reach this link. Please check the URL and try again.' }
  }

  try {
    const { document } = parseHTML(html)
    const reader = new Readability(document as unknown as Document, { charThreshold: MIN_ARTICLE_CHARS })
    const article = reader.parse()
    const textContent = article?.textContent?.trim() ?? ''

    if (textContent.length < MIN_ARTICLE_CHARS) {
      return { success: false, error: 'We could not find readable article content on this page — it may require sign-in or load its content via JavaScript.' }
    }

    const { content } = normalizeContent(textContent)
    const title = article?.title?.trim() || url.hostname
    return { success: true, title, content }
  } catch (error) {
    logger.warn('[UrlImport] Readability parse failed', { url: url.toString(), error: error instanceof Error ? error.message : String(error) })
    return { success: false, error: 'We could not extract readable content from this page.' }
  }
}
