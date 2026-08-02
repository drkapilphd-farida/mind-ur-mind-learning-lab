// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. No real
// language-detection library exists in this codebase. "If detection is
// uncertain, language = null. Never guess" (per the brief) is taken
// literally: without a real detector, every result is honestly uncertain,
// so this always returns null today. A heuristic (e.g. stopword-frequency
// guessing) would still be a guess — disclosed here as the seam a future
// sprint (adding a real, small language-identification library) would
// replace, not implemented as a guess in the meantime.
export function detectLanguage(_content: string): string | null {
  return null
}
