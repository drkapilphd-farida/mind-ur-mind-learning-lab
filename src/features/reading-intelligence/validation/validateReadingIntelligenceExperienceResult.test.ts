import { describe, expect, it } from 'vitest'
import { makeReadingIntelligenceExperienceResult, makeReadingJourneyState, makeReadingProgressSnapshot, makeReadingXp } from '../testFixtures'
import { validateReadingIntelligenceExperienceResult } from './validateReadingIntelligenceExperienceResult'

describe('validateReadingIntelligenceExperienceResult', () => {
  it('accepts a well-formed result', () => {
    const result = makeReadingIntelligenceExperienceResult()
    expect(validateReadingIntelligenceExperienceResult(result)).toEqual({ valid: true, issues: [] })
  })

  it('Non-negative XP: rejects a negative XP field', () => {
    const result = makeReadingIntelligenceExperienceResult({ xp: makeReadingXp({ totalXp: -5 }) })
    const validation = validateReadingIntelligenceExperienceResult(result)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'non-negative-xp')).toBe(true)
  })

  it('Progress Count Overflow: rejects completedCount exceeding totalCount', () => {
    const result = makeReadingIntelligenceExperienceResult({
      progressSnapshot: makeReadingProgressSnapshot({ overallCompletedCount: 10, overallTotalCount: 5 }),
    })
    const validation = validateReadingIntelligenceExperienceResult(result)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'progress-count-overflow')).toBe(true)
  })

  it('Mind Score Out of Range: rejects a mindScore above 1000', () => {
    const result = makeReadingIntelligenceExperienceResult({
      journeyState: makeReadingJourneyState({ mindScore: 1500 }),
    })
    const validation = validateReadingIntelligenceExperienceResult(result)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'mind-score-out-of-range')).toBe(true)
  })

  it('Co-occurring Issues: multiple problems in one result all surface together', () => {
    const result = makeReadingIntelligenceExperienceResult({
      xp: makeReadingXp({ totalXp: -1 }),
      journeyState: makeReadingJourneyState({ mindScore: -10 }),
    })
    const validation = validateReadingIntelligenceExperienceResult(result)

    expect(validation.issues).toHaveLength(2)
  })
})
