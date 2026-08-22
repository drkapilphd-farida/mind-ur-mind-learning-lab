import type { DailyQuantumSessionRecord } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { TOTAL_JOURNEY_DAYS } from '../quantumJourneyLevels'

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

// Retention Accuracy score (0-100) — the real average accuracy_percent
// (the Retention Check quiz portion of each daily session, across every
// pillar the journey covers — Reading, Intuition, Right Brain,
// Visualisation — never just the reading exercises specifically) across
// every real journey session so far. Null before any session exists
// (Mind Score computation excludes it entirely rather than treating "no
// data" as 0, per computeMindScore's own doc comment).
export function computeAverageAccuracyPercent(history: readonly DailyQuantumSessionRecord[]): number | null {
  if (history.length === 0) return null
  return Math.round(history.reduce((sum, session) => sum + session.accuracyPercent, 0) / history.length)
}

// Habit Completion Rate% — real sessions completed so far against the
// journey's fixed real length (TOTAL_JOURNEY_DAYS), capped at 100 (a
// student who's already retried past days can't exceed "fully complete").
// Habit App Isolation™ — this, not WPM growth, is the honest headline
// metric for a pure habit-building program: "how much of the 21 days have
// you actually shown up for," never a speed-reading figure.
export function computeHabitCompletionPercent(sessionsCompleted: number): number {
  return Math.min(100, Math.round((sessionsCompleted / TOTAL_JOURNEY_DAYS) * 100))
}
