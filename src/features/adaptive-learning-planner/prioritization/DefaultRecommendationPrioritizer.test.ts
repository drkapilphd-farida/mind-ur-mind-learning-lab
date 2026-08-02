import { describe, expect, it } from 'vitest'
import { createRecommendationPrioritizer } from './DefaultRecommendationPrioritizer'
import { makeSkillGap } from '../testFixtures'

describe('DefaultRecommendationPrioritizer', () => {
  const prioritizer = createRecommendationPrioritizer()

  it('ranks the highest gapScore as rank 1', () => {
    const gaps = [makeSkillGap({ skill: 'memory', gapScore: 20 }), makeSkillGap({ skill: 'reading', gapScore: 90 })]
    const result = prioritizer.prioritize(gaps)
    expect(result[0]).toEqual({ skill: 'reading', rank: 1, gapScore: 90 })
  })

  it('assigns sequential ranks starting at 1', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 10 }), makeSkillGap({ skill: 'memory', gapScore: 50 }), makeSkillGap({ skill: 'focus', gapScore: 30 })]
    const result = prioritizer.prioritize(gaps)
    expect(result.map((rec) => rec.rank)).toEqual([1, 2, 3])
  })

  it('breaks ties by keeping the original input order (stable sort)', () => {
    const gaps = [makeSkillGap({ skill: 'reading', gapScore: 50 }), makeSkillGap({ skill: 'memory', gapScore: 50 })]
    const result = prioritizer.prioritize(gaps)
    expect(result.map((rec) => rec.skill)).toEqual(['reading', 'memory'])
  })

  it('returns an empty list for an empty input', () => {
    expect(prioritizer.prioritize([])).toEqual([])
  })
})
