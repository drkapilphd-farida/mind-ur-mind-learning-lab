import { describe, expect, it } from 'vitest'
import { createSessionPlanningEngine } from './DefaultSessionPlanningEngine'
import { makeSkillGap } from '../testFixtures'

describe('DefaultSessionPlanningEngine', () => {
  const engine = createSessionPlanningEngine()

  it('returns zero minutes and no segments for zero availableMinutes', () => {
    expect(engine.planSession(0, [makeSkillGap()])).toEqual({ totalMinutes: 0, segments: [] })
  })

  it('returns no segments when every skill gap is zero', () => {
    const result = engine.planSession(30, [makeSkillGap({ gapScore: 0 })])
    expect(result).toEqual({ totalMinutes: 30, segments: [] })
  })

  it('splits time proportionally to gapScore', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 75 }), makeSkillGap({ skill: 'memory', gapScore: 25 })]
    const result = engine.planSession(100, gaps)
    const reading = result.segments.find((segment) => segment.skill === 'reading')
    const memory = result.segments.find((segment) => segment.skill === 'memory')
    expect(reading?.minutes).toBe(75)
    expect(memory?.minutes).toBe(25)
  })

  it('segments always sum to exactly totalMinutes, even with rounding', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 33 }), makeSkillGap({ skill: 'memory', gapScore: 33 }), makeSkillGap({ skill: 'focus', gapScore: 34 })]
    const result = engine.planSession(50, gaps)
    const total = result.segments.reduce((sum, segment) => sum + segment.minutes, 0)
    expect(total).toBe(50)
  })

  it('skips a skill with a zero gap while still allocating time to the others', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 100 }), makeSkillGap({ skill: 'memory', gapScore: 0 })]
    const result = engine.planSession(30, gaps)
    expect(result.segments.map((segment) => segment.skill)).toEqual(['reading'])
  })
})
