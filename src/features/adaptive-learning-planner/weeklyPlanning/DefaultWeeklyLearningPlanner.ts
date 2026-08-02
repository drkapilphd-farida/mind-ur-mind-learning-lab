import type { DailyStudyPlan, DayOfWeek, WeeklySchedule } from '../types'
import type { WeeklyLearningPlanner } from '../contracts'

const WEEK_DAYS: readonly DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const REST_DAYS = new Set<DayOfWeek>(['saturday', 'sunday'])

// Implements WeeklyLearningPlanner. A fixed, deterministic 5-study/
// 2-rest week (weekend off) — every study day gets the exact same
// `dailyPlan.totalMinutesPerDay`, never a fabricated variation.
export class DefaultWeeklyLearningPlanner implements WeeklyLearningPlanner {
  planWeek(dailyPlan: DailyStudyPlan): WeeklySchedule {
    const days = WEEK_DAYS.map((day) => {
      const isRestDay = REST_DAYS.has(day)
      return { day, minutes: isRestDay ? 0 : dailyPlan.totalMinutesPerDay, isRestDay }
    })

    return { days, totalMinutesPerWeek: days.reduce((sum, entry) => sum + entry.minutes, 0) }
  }
}

export function createWeeklyLearningPlanner(): WeeklyLearningPlanner {
  return new DefaultWeeklyLearningPlanner()
}
