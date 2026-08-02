import { describe, expect, it } from 'vitest'
import { makeReadingPlayerSessionSummary } from '../testFixtures'
import { validateReadingPlayerSessionSummary } from './validateReadingPlayerSessionSummary'

describe('validateReadingPlayerSessionSummary', () => {
  it('accepts a well-formed summary', () => {
    expect(validateReadingPlayerSessionSummary(makeReadingPlayerSessionSummary())).toEqual({
      valid: true,
      issues: [],
    })
  })

  it('accepts a null readingScore (unscored modes, e.g. RSVP)', () => {
    const summary = makeReadingPlayerSessionSummary({ readingScore: null })
    expect(validateReadingPlayerSessionSummary(summary)).toEqual({ valid: true, issues: [] })
  })

  it('Reading Score Out Of Range: rejects a readingScore above 100', () => {
    const summary = makeReadingPlayerSessionSummary({ readingScore: 150 })
    const validation = validateReadingPlayerSessionSummary(summary)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'reading-score-out-of-range')).toBe(true)
  })

  it('Mind Score Out Of Range: rejects a negative mindScore', () => {
    const summary = makeReadingPlayerSessionSummary({ mindScore: -1 })
    const validation = validateReadingPlayerSessionSummary(summary)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'mind-score-out-of-range')).toBe(true)
  })

  it('Non-negative XP: rejects a negative XP field', () => {
    const summary = makeReadingPlayerSessionSummary({
      xp: { totalXp: -10, fromCompletedExercises: 0, fromStreak: -10 },
    })
    const validation = validateReadingPlayerSessionSummary(summary)

    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'non-negative-xp')).toBe(true)
  })

  it('Co-occurring Issues: multiple problems all surface together', () => {
    const summary = makeReadingPlayerSessionSummary({ readingScore: -5, mindScore: 2000 })
    const validation = validateReadingPlayerSessionSummary(summary)

    expect(validation.issues).toHaveLength(2)
  })
})
