export type ReadabilityMetrics = {
  wordCount: number
  characterCount: number
  paragraphCount: number
  estimatedReadingMinutes: number
}

// Matches the same words-per-minute constant already established in
// src/lib/reading/generateReadingPassage.ts — one shared assumption, not
// a second number invented separately for this engine.
const AVERAGE_READING_WPM = 200

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Pure.
// Metadata only, per the brief — never influences extracted content
// itself.
export function computeReadability(paragraphs: readonly string[]): ReadabilityMetrics {
  const content = paragraphs.join(' ').trim()
  const wordCount = content.length > 0 ? content.split(/\s+/).length : 0
  const characterCount = content.length
  const paragraphCount = paragraphs.length
  const estimatedReadingMinutes = wordCount > 0 ? Math.max(1, Math.round(wordCount / AVERAGE_READING_WPM)) : 0

  return { wordCount, characterCount, paragraphCount, estimatedReadingMinutes }
}
