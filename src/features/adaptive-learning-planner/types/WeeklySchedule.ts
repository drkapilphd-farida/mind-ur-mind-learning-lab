import type { WeeklyScheduleDay } from './WeeklyScheduleDay'

// The Weekly Learning Planner's™ output — always exactly 7 entries,
// one per day, in Monday-first order.
export type WeeklySchedule = {
  days: readonly WeeklyScheduleDay[]
  totalMinutesPerWeek: number
}
