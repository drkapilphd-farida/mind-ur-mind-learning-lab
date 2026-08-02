import type { DailyStudyPlan, WeeklySchedule } from '../types'

// 5 study days (Monday-Friday) + 2 rest days (weekend) by default —
// see DefaultWeeklyLearningPlanner for the exact, deterministic rule.
export interface WeeklyLearningPlanner {
  planWeek(dailyPlan: DailyStudyPlan): WeeklySchedule
}
