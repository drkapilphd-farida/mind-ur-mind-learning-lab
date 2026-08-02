// Reading Intelligence Engine™ Upgrade — Sprint-3: Reading Experience
// Engine™. The same small, local, deterministic reading-time formula
// Sprint-2's own `learning-assets/internal/textHelpers.ts` already uses
// — deliberately duplicated rather than cross-imported (this engine
// consumes Learning Assets as data, not as a sibling module's internals;
// Sprint-1/2 already established "small internal helpers stay local"
// as this codebase's own precedent).
const AVERAGE_READING_WPM = 200

export function estimateReadingSeconds(text: string): number {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 0
  const wordCount = trimmed.split(/\s+/).length
  return Math.max(1, Math.round((wordCount / AVERAGE_READING_WPM) * 60))
}

export function normalizeForMatching(value: string): string {
  return value.trim().toLowerCase()
}
