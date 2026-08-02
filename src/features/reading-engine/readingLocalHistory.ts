// Master Reading Engine™ (Sprint 3.1A) — parametrized Best Record store.
// Generalizes verticalWordReadingLocalHistory.ts's hardcoded-key pattern
// (same SSR-safe load/save convention as readingPreferences.ts) so every
// future mode gets a Best Record for its own storage key without
// copy-pasting the module. This repo has ~15 other hardcoded-key
// per-exercise "best score" files (numberFlashHistory.ts, wordFlashHistory.ts,
// etc.) — this is a deliberate, narrowly-scoped departure from that
// convention for reading modes only, not a repo-wide refactor.

export function loadBestWpm(storageKey: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return 0
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return 0
    const bestWpm = (parsed as { bestWpm?: unknown }).bestWpm
    return typeof bestWpm === 'number' && Number.isFinite(bestWpm) && bestWpm >= 0 ? bestWpm : 0
  } catch {
    return 0
  }
}

// Returns the (possibly unchanged) best after comparing against the
// previous value — callers never need their own Math.max.
export function recordBestWpmSession(storageKey: string, sessionWpm: number): number {
  const best = Math.max(loadBestWpm(storageKey), sessionWpm)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ bestWpm: best }))
    } catch {
      // localStorage full or blocked — fail silently, best record just resets next visit
    }
  }
  return best
}
