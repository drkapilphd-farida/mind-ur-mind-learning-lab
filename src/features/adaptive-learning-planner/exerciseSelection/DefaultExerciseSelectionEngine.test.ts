import { describe, expect, it } from 'vitest'
import { createExerciseSelectionEngine } from './DefaultExerciseSelectionEngine'
import { makeSkillGap } from '../testFixtures'

describe('DefaultExerciseSelectionEngine', () => {
  const engine = createExerciseSelectionEngine()

  it('selects 1 exercise per skill at beginner difficulty', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 100 })]
    const result = engine.selectExercises(gaps, 'beginner')
    expect(result.filter((rec) => rec.skill === 'reading')).toHaveLength(1)
  })

  it('selects more exercises per skill at higher difficulty', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 100 })]
    const result = engine.selectExercises(gaps, 'advanced')
    expect(result.filter((rec) => rec.skill === 'reading')).toHaveLength(3)
  })

  it('skips a skill with a zero gap', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 100 }), makeSkillGap({ skill: 'memory', gapScore: 0 })]
    const result = engine.selectExercises(gaps, 'beginner')
    expect(result.some((rec) => rec.skill === 'memory')).toBe(false)
  })

  it('orders recommendations highest-gap-first', () => {
    const gaps = [makeSkillGap({ skill: 'memory', gapScore: 20 }), makeSkillGap({ skill: 'reading', gapScore: 90 })]
    const result = engine.selectExercises(gaps, 'beginner')
    expect(result[0]?.skill).toBe('reading')
  })

  it('sets priority equal to the skill gap score', () => {
    const gaps = [makeSkillGap({ skill: 'focus', gapScore: 66 })]
    const result = engine.selectExercises(gaps, 'beginner')
    expect(result[0]?.priority).toBe(66)
  })
})
