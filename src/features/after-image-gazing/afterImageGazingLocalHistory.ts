// Best-stats store for After-Image / Complementary Color Gazing™ — a
// small, narrowly scoped parallel to every other exercise's own
// local-history file in this project, not shared with any of them. Same
// SSR-safe localStorage convention and "0 means no record yet" sentinel
// every other local-history file in this project already establishes.
//
// "bestClarityPercent" is the % of rounds a learner self-reported as a
// clear afterimage — a genuine, non-fabricated figure (it's literally
// their own answers), never a computed "score" for a physiological
// response nobody can grade as right or wrong.
export type AfterImageGazingBestStats = {
  bestClarityPercent: number
  bestStreak: number
}

const EMPTY_BEST: AfterImageGazingBestStats = { bestClarityPercent: 0, bestStreak: 0 }

export function loadBestAfterImageGazingStats(storageKey: string): AfterImageGazingBestStats {
  if (typeof window === 'undefined') return EMPTY_BEST
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return EMPTY_BEST
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_BEST
    const record = parsed as { bestClarityPercent?: unknown; bestStreak?: unknown }
    const bestClarityPercent =
      typeof record.bestClarityPercent === 'number' && Number.isFinite(record.bestClarityPercent) ? record.bestClarityPercent : 0
    const bestStreak = typeof record.bestStreak === 'number' && Number.isFinite(record.bestStreak) ? record.bestStreak : 0
    return { bestClarityPercent, bestStreak }
  } catch {
    return EMPTY_BEST
  }
}

// Returns the (possibly unchanged) best after comparing against the
// previous value — callers never need their own Math.max. Both fields
// are higher-is-better, so each is maxed independently.
export function recordBestAfterImageGazingStats(
  storageKey: string,
  session: AfterImageGazingBestStats,
): AfterImageGazingBestStats {
  const previous = loadBestAfterImageGazingStats(storageKey)
  const next: AfterImageGazingBestStats = {
    bestClarityPercent: Math.max(previous.bestClarityPercent, session.bestClarityPercent),
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
