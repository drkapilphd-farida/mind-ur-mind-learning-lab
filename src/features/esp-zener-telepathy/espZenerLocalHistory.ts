// Best-stats store for ESP Zener Card Telepathy Sprint™ — a small, narrowly
// scoped parallel to readingLocalHistory.ts/schulteGridLocalHistory.ts, not
// a reuse of either (this exercise tracks two independent higher-is-better
// values — accuracy percent and streak length — rather than one WPM or
// one completion time). Same SSR-safe localStorage convention and "0 means
// no record yet" sentinel those files already establish as this project's
// per-exercise-type pattern.
export type EspZenerBestStats = {
  bestAccuracyPercent: number
  bestStreak: number
}

const EMPTY_BEST: EspZenerBestStats = { bestAccuracyPercent: 0, bestStreak: 0 }

export function loadBestEspStats(storageKey: string): EspZenerBestStats {
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
// previous value — callers never need their own Math.max. Both fields are
// higher-is-better, so each is maxed independently.
export function recordBestEspStats(storageKey: string, session: EspZenerBestStats): EspZenerBestStats {
  const previous = loadBestEspStats(storageKey)
  const next: EspZenerBestStats = {
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
