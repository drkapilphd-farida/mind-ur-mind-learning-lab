import type { DailyQuantumSessionRecord } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'

// Analytics Dashboard™ — pure transforms only, no DB access. Mirrors this
// project's existing convention (mindScore.ts, dailyQuantumSessionTracking.ts):
// small, independently testable functions computed fresh from real data,
// never a separately mutable running total.

// Consistency% — the percentage of days, since the user's very first real
// session, that they've actually shown up. Deliberately NOT "days active
// in the last 7" (computeWeeklyActivity's own narrower window) — this is a
// lifetime figure spanning the whole journey so far. A user who joined
// today and practiced today is 100% consistent; one who joined 10 days
// ago and has 3 sessions is 30%, honestly.
export function computeConsistencyPercent(history: readonly DailyQuantumSessionRecord[]): number {
  if (history.length === 0) return 0
  const oldest = history[history.length - 1]!
  const daysSinceFirstSession = Math.max(
    1,
    Math.floor((Date.now() - new Date(oldest.occurredAt).getTime()) / 86_400_000) + 1,
  )
  const activeDayKeys = new Set(history.map((session) => session.occurredAt.slice(0, 10)))
  return Math.min(100, Math.round((activeDayKeys.size / daysSinceFirstSession) * 100))
}

// Speed Growth% — Day 1 Baseline vs the latest real session's True WPM.
// Null when there's no honest percentage to compute yet: no baseline, no
// sessions yet, or a baseline of 0 (a real, honest possibility under True
// WPM™ — see trueWpm.ts) would divide by zero.
export function computeSpeedGrowthPercent(baselineWpm: number | null, latestWpm: number | null): number | null {
  if (baselineWpm === null || baselineWpm <= 0 || latestWpm === null) return null
  return Math.round(((latestWpm - baselineWpm) / baselineWpm) * 100)
}

// Reading Comprehension score (0-100) — the real average accuracy_percent
// across every real journey session so far. Null before any session
// exists (Mind Score computation excludes it entirely rather than
// treating "no data" as 0, per computeMindScore's own doc comment).
export function computeAverageAccuracyPercent(history: readonly DailyQuantumSessionRecord[]): number | null {
  if (history.length === 0) return null
  return Math.round(history.reduce((sum, session) => sum + session.accuracyPercent, 0) / history.length)
}

export type WpmChartPoint = { label: string; wpm: number; isBaseline: boolean }

// Builds the ordered point series for the WPM Progress Chart: the
// immutable Day 1 Baseline first (if it exists), then every real journey
// session in chronological (oldest-first) order. `history` itself arrives
// most-recent-first (getDailyQuantumSessionHistory's own convention), so
// it's reversed here.
export function buildWpmChartPoints(
  baselineWpm: number | null,
  history: readonly DailyQuantumSessionRecord[],
): readonly WpmChartPoint[] {
  const points: WpmChartPoint[] = []
  if (baselineWpm !== null) {
    points.push({ label: 'Baseline', wpm: baselineWpm, isBaseline: true })
  }
  const oldestFirst = [...history].reverse()
  oldestFirst.forEach((session, index) => {
    points.push({ label: `Day ${index + 1}`, wpm: session.readingWpm, isBaseline: false })
  })
  return points
}
