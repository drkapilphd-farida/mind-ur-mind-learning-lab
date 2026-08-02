// Best-stats store shared by the 4 Brain Gym drills (Saccadic Eye Jump™,
// Peripheral Expanding Circle™, Fast Pattern Blinking™, Cross-Lateral
// Tap™) — a small, narrowly scoped parallel to espZenerLocalHistory.ts's
// own real precedent (same shape, same SSR-safe localStorage convention,
// same "0 means no record yet" sentinel), shared across these 4 rather
// than copy-pasted 4 times since they're built together, in one sprint,
// with genuinely identical mechanics and stats shape.
export type BrainGymBestStats = {
  bestAccuracyPercent: number
  bestStreak: number
}

const EMPTY_BEST: BrainGymBestStats = { bestAccuracyPercent: 0, bestStreak: 0 }

export function loadBestBrainGymStats(storageKey: string): BrainGymBestStats {
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

export function recordBestBrainGymStats(storageKey: string, session: BrainGymBestStats): BrainGymBestStats {
  const previous = loadBestBrainGymStats(storageKey)
  const next: BrainGymBestStats = {
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
