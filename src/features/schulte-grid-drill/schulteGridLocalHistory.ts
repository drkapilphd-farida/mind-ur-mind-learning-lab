// Best Time store for Schulte Grid Speed Drill™ — a small, narrowly-
// scoped parallel to readingLocalHistory.ts, not a reuse of it. That
// file's bestWpm comparison is `Math.max` (higher WPM is better); a grid
// completion time is the opposite (lower is better), so reusing it
// as-is would silently keep the WORST (slowest) time as "best." This
// follows the exact same SSR-safe localStorage convention
// readingLocalHistory.ts itself documents as this project's established
// per-exercise-type pattern — including its own "0 means no record yet"
// sentinel (a real grid-clear time is always > 0ms), so callers already
// familiar with loadBestWpm's contract get the identical shape here.

export function loadBestTimeMs(storageKey: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return 0
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return 0
    const bestTimeMs = (parsed as { bestTimeMs?: unknown }).bestTimeMs
    return typeof bestTimeMs === 'number' && Number.isFinite(bestTimeMs) && bestTimeMs > 0 ? bestTimeMs : 0
  } catch {
    return 0
  }
}

// Returns the (possibly unchanged) best after comparing against the
// previous value — callers never need their own Math.min. A previous
// value of 0 means "no record yet," so the session's own time always
// becomes the new best rather than being compared against the sentinel.
export function recordBestTimeMs(storageKey: string, sessionTimeMs: number): number {
  const previousBest = loadBestTimeMs(storageKey)
  const best = previousBest === 0 ? sessionTimeMs : Math.min(previousBest, sessionTimeMs)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ bestTimeMs: best }))
    } catch {
      // localStorage full or blocked — fail silently, best record just resets next visit
    }
  }
  return best
}
