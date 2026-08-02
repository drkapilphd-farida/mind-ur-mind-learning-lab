// Best-stats store for High-Speed Pictorial Essence Sprint™ — a small,
// narrowly scoped parallel to every other exercise's own local-history
// file in this project, not shared with any of them. Same SSR-safe
// localStorage convention and "0 means no record yet" sentinel every
// other local-history file in this project already establishes.
export type PictorialEssenceSprintBestStats = {
  bestAccuracyPercent: number
  bestStreak: number
}

const EMPTY_BEST: PictorialEssenceSprintBestStats = { bestAccuracyPercent: 0, bestStreak: 0 }

export function loadBestEssenceSprintStats(storageKey: string): PictorialEssenceSprintBestStats {
  if (typeof window === 'undefined') return EMPTY_BEST
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return EMPTY_BEST
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_BEST
    const record = parsed as { bestAccuracyPercent?: unknown; bestStreak?: unknown }
    const bestAccuracyPercent =
      typeof record.bestAccuracyPercent === 'number' && Number.isFinite(record.bestAccuracyPercent) ? record.bestAccuracyPercent : 0
    const bestStreak = typeof record.bestStreak === 'number' && Number.isFinite(record.bestStreak) ? record.bestStreak : 0
    return { bestAccuracyPercent, bestStreak }
  } catch {
    return EMPTY_BEST
  }
}

// Returns the (possibly unchanged) best after comparing against the
// previous value — callers never need their own Math.max. Both fields
// are higher-is-better, so each is maxed independently.
export function recordBestEssenceSprintStats(
  storageKey: string,
  session: PictorialEssenceSprintBestStats,
): PictorialEssenceSprintBestStats {
  const previous = loadBestEssenceSprintStats(storageKey)
  const next: PictorialEssenceSprintBestStats = {
    bestAccuracyPercent: Math.max(previous.bestAccuracyPercent, session.bestAccuracyPercent),
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
