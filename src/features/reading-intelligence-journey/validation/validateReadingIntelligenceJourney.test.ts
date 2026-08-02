import { describe, expect, it } from 'vitest'
import { makeReadingExerciseQueue, makeReadingIntelligenceJourney } from '../testFixtures'
import { validateReadingIntelligenceJourney } from './validateReadingIntelligenceJourney'

describe('validateReadingIntelligenceJourney', () => {
  it('accepts a well-formed journey', () => {
    expect(validateReadingIntelligenceJourney(makeReadingIntelligenceJourney())).toEqual({
      valid: true,
      issues: [],
    })
  })

  it('Queue Remaining Count Overflow: rejects remainingCount exceeding the item count', () => {
    const journey = makeReadingIntelligenceJourney({
      queue: makeReadingExerciseQueue({ remainingCount: 99 }),
    })
    const validation = validateReadingIntelligenceJourney(journey)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'queue-remaining-count-overflow')).toBe(true)
  })

  it('Mind Score Out Of Range: rejects a mindScore above 1000', () => {
    const journey = makeReadingIntelligenceJourney({ mindScore: 1200 })
    const validation = validateReadingIntelligenceJourney(journey)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'mind-score-out-of-range')).toBe(true)
  })

  it('Non-negative XP: rejects a negative XP field', () => {
    const journey = makeReadingIntelligenceJourney({
      xp: { totalXp: -1, fromCompletedExercises: 0, fromStreak: -1 },
    })
    const validation = validateReadingIntelligenceJourney(journey)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'non-negative-xp')).toBe(true)
  })

  it('Progress Count Overflow: rejects completedCount exceeding totalCount', () => {
    const journey = makeReadingIntelligenceJourney({
      progress: { stages: [], overallCompletedCount: 20, overallTotalCount: 10, overallPercent: 100 },
    })
    const validation = validateReadingIntelligenceJourney(journey)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'progress-count-overflow')).toBe(true)
  })

  it('Co-occurring Issues: multiple problems all surface together', () => {
    const journey = makeReadingIntelligenceJourney({ mindScore: -5, xp: { totalXp: -1, fromCompletedExercises: 0, fromStreak: 0 } })
    const validation = validateReadingIntelligenceJourney(journey)

    expect(validation.issues).toHaveLength(2)
  })
})
