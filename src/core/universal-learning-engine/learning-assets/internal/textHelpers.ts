// Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
// Generator™. Small, local, deterministic text helpers — deliberately
// NOT imported from `learning-blueprint/internal/graphHelpers.ts` (a
// sibling module's own private internal/ folder); this module keeps its
// own tiny copies, matching Sprint-1's own precedent of small, focused,
// independently-owned internal helpers rather than premature sharing.

export function normalizeForMatching(value: string): string {
  return value.trim().toLowerCase()
}

// Real, case-insensitive substring match — the one relevance test every
// builder in this module uses to decide whether an already-real piece of
// Blueprint text (a keyword, phrase, sentence, paragraph) genuinely
// concerns a given Learning Object. Never a fuzzy/AI match.
export function containsText(haystack: string, needle: string): boolean {
  if (!needle.trim()) return false
  return normalizeForMatching(haystack).includes(normalizeForMatching(needle))
}

// The same plain, deterministic sentence split Sprint-1's own
// `aggregateReadingAssets.ts` already uses — no NLP library, no AI call.
export function splitIntoSentences(content: string): readonly string[] {
  return content
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

// No per-concept time estimate exists anywhere upstream (confirmed:
// `ConceptAnalysis` carries none) — this is a real, deterministic
// computation over this object's own real text, at the same 200
// words-per-minute reading speed this codebase already uses for real
// chunk-level `estimatedReadingSeconds`, just applied at a smaller,
// equally real granularity. Never a fabricated placeholder.
const AVERAGE_READING_WPM = 200

export function estimateReadingSeconds(text: string): number {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 0
  const wordCount = trimmed.split(/\s+/).length
  return Math.max(1, Math.round((wordCount / AVERAGE_READING_WPM) * 60))
}

// The one real, deterministic, stable synthetic paragraph id this
// sprint establishes — no stable per-block id exists upstream
// (confirmed: `LearningContentBlock` has none). Shared here so
// `enhanceLearningObjects.ts` and `buildParagraphAssets.ts` can never
// drift apart on the same real chapter's own paragraph ids.
export function paragraphIdAt(chapterId: string, index: number): string {
  return `${chapterId}-paragraph-${index}`
}
