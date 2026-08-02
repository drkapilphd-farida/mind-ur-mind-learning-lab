import type { DailyQuantumSessionRecord } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'

// Baseline Test™ (legacy fallback) — before the mandatory 30-Second
// Baseline Speed & Comprehension Diagnostic™ existed, Day 1's first-ever
// real Quantum Reading Sprint stood in as the user's baseline. Kept only
// for users who started their journey before that diagnostic shipped and
// so never have a journey_baseline_diagnostics row — see
// journey/[day]/page.tsx's own comment on why the diagnostic always wins
// when both exist. `history` is ordered most-recent-first, so the OLDEST
// row is simply the last element — true as long as the fetched history
// covers the user's entire real session count, which it does for anyone
// within a 21-day journey (getDailyQuantumSessionHistory's default limit
// is 30).
export function getBaselineSession(history: readonly DailyQuantumSessionRecord[]): DailyQuantumSessionRecord | null {
  if (history.length === 0) return null
  return history[history.length - 1] ?? null
}

// Auto-Pacing WPM Adjustment™ — a real, bounded speed-scaling multiplier
// derived from the most recent reading sprint's own comprehension
// accuracy (never from an auxiliary exercise's accuracy/reaction-time —
// see quantumJourneyLevels.ts's own metric-separation comment). Anchored
// to the user's OWN real baseline WPM (from their Day 1 session) rather
// than a generic fixed constant — DEFAULT_REFERENCE_WPM only applies
// before any baseline exists yet (i.e., computing Day 1's own pace,
// before Day 1 has ever been completed).
const DEFAULT_REFERENCE_WPM = 200
const HIGH_ACCURACY_THRESHOLD = 80
const LOW_ACCURACY_THRESHOLD = 50
// Midpoint of the requested "+10 to +20 WPM" range.
const WPM_ADJUSTMENT = 15
const MIN_SPEED_MULTIPLIER = 0.5

// >80% accuracy last time → bump the pace up by ~WPM_ADJUSTMENT WPM
// relative to the user's own real baseline. <50% → gently scale back by
// the same amount (floored so it never goes below half speed). Anything
// in between (or no prior session yet) leaves pacing unchanged.
export function computeAutoPacedSpeedMultiplier(previousReadingAccuracyPercent: number | null, baselineWpm: number | null): number {
  // True WPM can honestly be 0 (zero comprehension that day — see
  // trueWpm.ts) and that 0 can itself become a stored baseline. Guard
  // against it here rather than dividing by zero below; a baseline this
  // low falls back to the same generic constant used before any real
  // baseline exists at all.
  const referenceWpm = baselineWpm !== null && baselineWpm > 0 ? baselineWpm : DEFAULT_REFERENCE_WPM
  if (previousReadingAccuracyPercent === null) return 1
  if (previousReadingAccuracyPercent > HIGH_ACCURACY_THRESHOLD) return (referenceWpm + WPM_ADJUSTMENT) / referenceWpm
  if (previousReadingAccuracyPercent < LOW_ACCURACY_THRESHOLD) {
    return Math.max((referenceWpm - WPM_ADJUSTMENT) / referenceWpm, MIN_SPEED_MULTIPLIER)
  }
  return 1
}
