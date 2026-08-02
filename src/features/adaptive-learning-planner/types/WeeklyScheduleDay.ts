import type { DayOfWeek } from './DayOfWeek'

export type WeeklyScheduleDay = {
  day: DayOfWeek
  minutes: number
  isRestDay: boolean
}
