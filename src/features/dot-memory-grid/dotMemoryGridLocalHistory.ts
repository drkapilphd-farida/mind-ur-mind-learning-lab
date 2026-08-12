// Best-stats store for Dot Memory Grid™ — a small, narrowly scoped
// parallel to every other exercise's own local-history file in this
// project (photographicMemoryLocalHistory.ts, espZenerLocalHistory.ts),
// not shared with any of them. Same SSR-safe localStorage convention and
// "0 means no record yet" sentinel those files already establish as this
// project's per-exercise-type pattern. Field names deliberately match
// PhotographicMemoryBestStats exactly (bestScorePercent/bestStreak) so
// RightBrainHubModeCard.tsx's BEST_STATS_LOADERS map can reference this
// loader directly, with no normalization wrapper needed.
export type DotMemoryGridBestStats = {
  bestScorePercent: number
  bestStreak: number
}

const EMPTY_BEST: DotMemoryGridBestStats = { bestScorePercent: 0, bestStreak: 0 }

export function loadBestDotMemoryGridStats(storageKey: string): DotMemoryGridBestStats {
  if (typeof window === 'undefined') return EMPTY_BEST
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return EMPTY_BEST
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_BEST
    const record = parsed as { bestScorePercent?: unknown; bestStreak?: unknown }
    const bestScorePercent =
      typeof record.bestScorePercent === 'number' && Number.isFinite(record.bestScorePercent) ? record.bestScorePercent : 0
    const bestStreak = typeof record.bestStreak === 'number' && Number.isFinite(record.bestStreak) ? record.bestStreak : 0
    return { bestScorePercent, bestStreak }
  } catch {
    return EMPTY_BEST
  }
}

// Returns the (possibly unchanged) best after comparing against the
// previous value — callers never need their own Math.max. Both fields
// are higher-is-better, so each is maxed independently.
export function recordBestDotMemoryGridStats(storageKey: string, session: DotMemoryGridBestStats): DotMemoryGridBestStats {
  const previous = loadBestDotMemoryGridStats(storageKey)
  const next: DotMemoryGridBestStats = {
    bestScorePercent: Math.max(previous.bestScorePercent, session.bestScorePercent),
    bestStreak: Math.max(previous.bestStreak, session.bestStreak),
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // localStorage full or blocked — fail silently, best record just resets next visit
    }
  }
  return next
}
