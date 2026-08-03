import { TOTAL_JOURNEY_DAYS } from './quantumJourneyLevels'

// Daily Streak Reminders & Motivation System™ — pure functions only, no
// DB/React. Mirrors this project's existing convention (trueWpm.ts,
// adaptivePacing.ts, analyticsMath.ts): small, independently testable
// transforms shared by the 21-Day Journey card, the post-session AI coach
// message, and the Journey Milestones badges.

export const JOURNEY_MILESTONE_STREAKS = [3, 7, 14, 21] as const

// A milestone "counts" the moment the user's streak reaches it — reused
// both by the dashboard banner (has this ever been reached?) and the
// post-session coach message (was THIS session the one that reached it?).
export function getReachedMilestones(longestStreakEver: number): readonly number[] {
  return JOURNEY_MILESTONE_STREAKS.filter((milestone) => longestStreakEver >= milestone)
}

// Exact-match only — reaching day 10 with a 3-day milestone already long
// past shouldn't re-congratulate; only the specific session that crosses
// a threshold for the first time in its current run should call it out.
export function getMilestoneHitExactly(streak: number): number | null {
  return (JOURNEY_MILESTONE_STREAKS as readonly number[]).includes(streak) ? streak : null
}

// Ordinal position (see adaptivePacing.ts's own getBaselineSession/
// getDay21Session comment): daily_quantum_sessions has no persisted "day
// number" column, so the next real day is simply one past however many
// real sessions already exist, clamped to the journey's real length.
export function getNextJourneyDay(sessionCount: number): number {
  return Math.min(TOTAL_JOURNEY_DAYS, sessionCount + 1)
}

