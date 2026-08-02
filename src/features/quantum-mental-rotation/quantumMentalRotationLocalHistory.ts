// Best-stats store for Quantum Mental Object Rotation™ — a small,
// narrowly scoped parallel to every other exercise's own local-history
// file in this project, not shared with any of them. Same SSR-safe
// localStorage convention and "0 means no record yet" sentinel every
// other local-history file in this project already establishes.
export type QuantumMentalRotationBestStats = {
  bestAccuracyPercent: number
  bestStreak: number
}

const EMPTY_BEST: QuantumMentalRotationBestStats = { bestAccuracyPercent: 0, bestStreak: 0 }

export function loadBestQuantumMentalRotationStats(storageKey: string): QuantumMentalRotationBestStats {
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
export function recordBestQuantumMentalRotationStats(
  storageKey: string,
  session: QuantumMentalRotationBestStats,
): QuantumMentalRotationBestStats {
  const previous = loadBestQuantumMentalRotationStats(storageKey)
  const next: QuantumMentalRotationBestStats = {
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
