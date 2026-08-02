import { describe, expect, it } from 'vitest'
import { createWeeklyLearningPlanner } from './DefaultWeeklyLearningPlanner'

describe('DefaultWeeklyLearningPlanner', () => {
  const planner = createWeeklyLearningPlanner()

  it('always returns exactly 7 days', () => {
    const schedule = planner.planWeek({ totalMinutesPerDay: 30, sessions: [] })
    expect(schedule.days).toHaveLength(7)
  })

  it('marks Saturday and Sunday as rest days with zero minutes', () => {
    const schedule = planner.planWeek({ totalMinutesPerDay: 30, sessions: [] })
    const saturday = schedule.days.find((day) => day.day === 'saturday')
    const sunday = schedule.days.find((day) => day.day === 'sunday')
    expect(saturday).toEqual({ day: 'saturday', minutes: 0, isRestDay: true })
    expect(sunday).toEqual({ day: 'sunday', minutes: 0, isRestDay: true })
  })

  it('gives every weekday the full dailyPlan.totalMinutesPerDay', () => {
    const schedule = planner.planWeek({ totalMinutesPerDay: 25, sessions: [] })
    const monday = schedule.days.find((day) => day.day === 'monday')
    expect(monday).toEqual({ day: 'monday', minutes: 25, isRestDay: false })
  })

  it('totalMinutesPerWeek is exactly 5x the daily minutes', () => {
    const schedule = planner.planWeek({ totalMinutesPerDay: 20, sessions: [] })
    expect(schedule.totalMinutesPerWeek).toBe(100)
  })
})
