export type NormalizedContent = {
  content: string
  paragraphs: readonly string[]
}

function collapseWhitespace(text: string): string {
  return text.replace(/[ \t]+/g, ' ').trim()
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Pure.
// Normalizes line endings (CRLF/CR → LF), collapses runs of blank lines
// down to real paragraph boundaries, normalizes internal whitespace, and
// preserves both paragraph structure and reading order. Used by every
// extractor as the last step before assembling `content`/`paragraphs`.
export function normalizeContent(rawText: string): NormalizedContent {
  const unifiedLineEndings = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const paragraphs = unifiedLineEndings
    .split(/\n\s*\n+/)
    .map((block) => collapseWhitespace(block.replace(/\n/g, ' ')))
    .filter((paragraph) => paragraph.length > 0)

  return {
    content: paragraphs.join('\n\n'),
    paragraphs,
  }
}
