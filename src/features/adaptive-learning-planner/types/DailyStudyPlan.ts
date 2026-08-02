import type { SessionPlan } from './SessionPlan'

// The Daily Study Planner's™ output — how many sessions make up one
// day's study, and the total minutes across all of them (the "Daily
// Duration" named in the Sprint 9 OUTPUT list).
export type DailyStudyPlan = {
  totalMinutesPerDay: number
  sessions: readonly SessionPlan[]
}
