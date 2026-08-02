import { describe, expect, it, vi } from 'vitest'
import { createDailyStudyPlanner } from './DefaultDailyStudyPlanner'
import { makeSkillGap } from '../testFixtures'
import type { SessionPlanningEngine } from '../contracts'

describe('DefaultDailyStudyPlanner', () => {
  it('returns zero minutes and no sessions for zero available minutes', () => {
    const planner = createDailyStudyPlanner()
    expect(planner.planDay(0, [makeSkillGap()])).toEqual({ totalMinutesPerDay: 0, sessions: [] })
  })

  it('produces exactly 1 session when availableMinutesPerDay is <= 45', () => {
    const planner = createDailyStudyPlanner()
    const result = planner.planDay(30, [makeSkillGap()])
    expect(result.sessions).toHaveLength(1)
    expect(result.totalMinutesPerDay).toBe(30)
  })

  it('produces exactly 2 sessions when availableMinutesPerDay is > 45', () => {
    const planner = createDailyStudyPlanner()
    const result = planner.planDay(60, [makeSkillGap()])
    expect(result.sessions).toHaveLength(2)
    expect(result.totalMinutesPerDay).toBe(60)
  })

  it('delegates session composition to the injected SessionPlanningEngine', () => {
    const planSessionSpy = vi.fn(() => ({ totalMinutes: 30, segments: [] }))
    const stubEngine: SessionPlanningEngine = { planSession: planSessionSpy }
    const planner = createDailyStudyPlanner({ sessionPlanningEngine: stubEngine })

    planner.planDay(30, [makeSkillGap()])
    expect(planSessionSpy).toHaveBeenCalledTimes(1)
  })
})
