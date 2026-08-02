// Best-stats store for Quantum Hidden Target Grid™ — a small, narrowly
// scoped parallel to espZenerLocalHistory.ts, not a reuse of it. Every
// exercise in this project owns its own local-history file self-contained
// (matching schulteGridLocalHistory.ts's own precedent alongside
// readingLocalHistory.ts), even where the shape happens to match a
// sibling exercise exactly. Same SSR-safe localStorage convention and "0
// means no record yet" sentinel every other local-history file in this
// project already establishes.
export type QuantumHiddenTargetGridBestStats = {
  bestAccuracyPercent: number
  bestStreak: number
}

const EMPTY_BEST: QuantumHiddenTargetGridBestStats = { bestAccuracyPercent: 0, bestStreak: 0 }

export function loadBestQuantumGridStats(storageKey: string): QuantumHiddenTargetGridBestStats {
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
export function recordBestQuantumGridStats(
  storageKey: string,
  session: QuantumHiddenTargetGridBestStats,
): QuantumHiddenTargetGridBestStats {
  const previous = loadBestQuantumGridStats(storageKey)
  const next: QuantumHiddenTargetGridBestStats = {
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
