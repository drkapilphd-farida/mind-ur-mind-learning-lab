import type { DailyStudyPlan, SkillGap } from '../types'

// Splits `availableMinutesPerDay` into 1 session (<=45 min) or 2
// sessions (>45 min) — a deterministic rule, not a fixed constant, so
// a longer available window genuinely produces more sessions.
export interface DailyStudyPlanner {
  planDay(availableMinutesPerDay: number, skillGaps: readonly SkillGap[]): DailyStudyPlan
}
