import { TOTAL_JOURNEY_DAYS } from './quantumJourneyLevels'

// Daily Streak Reminders & Motivation System™ — pure functions only, no
// DB/React. Mirrors this project's existing convention (trueWpm.ts,
// adaptivePacing.ts, analyticsMath.ts): small, independently testable
// transforms shared by the dashboard banner, the post-session AI coach
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

export type StreakBannerStatus = 'not-started' | 'completed-today' | 'streak-active' | 'streak-broken' | 'journey-complete'

type StreakBannerStatusInput = {
  sessionCount: number
  hasCompletedToday: boolean
  currentStreak: number
}

// The one banner-status decision the dashboard's streak reminder and its
// AI nudge both key off of. Order matters: journey-complete and
// not-started are checked first since they override the ordinary
// active/broken distinction entirely. Whether the user still needs to
// complete the mandatory Baseline Diagnostic first is a separate concern
// already handled by journey/[day]/page.tsx's own redirect — this banner
// only needs to know whether any real day has ever been completed.
export function getStreakBannerStatus({ sessionCount, hasCompletedToday, currentStreak }: StreakBannerStatusInput): StreakBannerStatus {
  if (sessionCount >= TOTAL_JOURNEY_DAYS) return 'journey-complete'
  if (sessionCount === 0) return 'not-started'
  if (hasCompletedToday) return 'completed-today'
  if (currentStreak > 0) return 'streak-active'
  return 'streak-broken'
}
