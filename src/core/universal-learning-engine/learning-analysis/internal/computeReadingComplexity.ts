// Real, disclosed heuristics — not a linguistic parser. `countSentences`
// counts real sentence-terminating punctuation runs (`.`/`!`/`?`,
// collapsing "..."/"?!" into one boundary each); `countSyllables` counts
// real vowel-group runs per word with a simple silent-`e` adjustment.
// Both are commonly-used, approximate English heuristics — the same
// class of disclosed approximation as `estimateTokens`'s ~4-chars-per-
// token heuristic already established in AIF-1 (@/features/ai-provider/
// adapters/estimateTokens.ts) — never claimed to be a full NLP parser.
function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g)
  return matches && matches.length > 0 ? matches.length : 1
}

function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '')
  if (normalized.length === 0) return 0

  const vowelGroups = normalized.match(/[aeiouy]+/g)
  let count = vowelGroups ? vowelGroups.length : 1
  if (normalized.endsWith('e') && count > 1) count -= 1

  return Math.max(1, count)
}

// AI Learning Analysis Engine™ (UCE-5). Pure. A real Flesch-Kincaid
// Grade Level formula — this is the exact "future sprint" UCE-3B's own
// `ChunkEnrichment.readingComplexity` comment named ("a real, non-AI
// formula — e.g. Flesch-Kincaid — could compute this... a low-risk,
// non-AI enhancement a future sprint could add cheaply"). Computed here,
// in UCE-5's own `ChunkAnalysis` output — never written back to the
// chunk (UCE-5's brief forbids modifying Semantic Enrichment). Clamped
// to a minimum of 0 — the raw formula can theoretically go negative for
// very short/simple text, which has no real meaning as a grade level.
export function computeReadingComplexity(content: string): number {
  const words = content.trim().split(/\s+/).filter((word) => word.length > 0)
  const wordCount = words.length
  if (wordCount === 0) return 0

  const sentenceCount = countSentences(content)
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0)

  const gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59
  return Math.max(0, gradeLevel)
}
