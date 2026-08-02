import { describe, it, expect } from 'vitest'
import { computeReadingDna, computeConfidence } from './readingDnaEngine'
import { buildSession } from './testFixtures'

describe('computeConfidence', () => {
  it('grows with more evidence but never reaches 100', () => {
    expect(computeConfidence(0)).toBe(0)
    const oneSession = computeConfidence(1)
    const fiveSessions = computeConfidence(5)
    const twentySessions = computeConfidence(20)
    expect(fiveSessions).toBeGreaterThan(oneSession)
    expect(twentySessions).toBeGreaterThan(fiveSessions)
    expect(twentySessions).toBeLessThan(100)
  })
})

describe('computeReadingDna', () => {
  it('returns 6 dimensions with "not enough data" and 0 confidence for no sessions', () => {
    const traits = computeReadingDna([])
    expect(traits).toHaveLength(6)
    for (const trait of traits) {
      expect(trait.confidence).toBe(0)
      expect(trait.label).toBe('Not enough data yet')
    }
  })

  it('never assigns a permanent label from a single session — confidence stays modest', () => {
    const traits = computeReadingDna([buildSession()])
    for (const trait of traits) {
      if (trait.confidence > 0) expect(trait.confidence).toBeLessThan(50)
    }
  })

  it('identifies Fast Reader from consistently high WPM', () => {
    const sessions = Array.from({ length: 5 }, () => buildSession({ wpm: 320, accuracyPercent: 85 }))
    const traits = computeReadingDna(sessions)
    const readingStyle = traits.find((t) => t.dimension === 'reading-style')
    expect(readingStyle?.label).toBe('Fast Reader')
  })

  it('identifies Deep Reader from consistently low WPM', () => {
    const sessions = Array.from({ length: 5 }, () => buildSession({ wpm: 120 }))
    const traits = computeReadingDna(sessions)
    const readingStyle = traits.find((t) => t.dimension === 'reading-style')
    expect(readingStyle?.label).toBe('Deep Reader')
  })

  it('identifies category preference from the most-practiced category, confidence scaled to that category count', () => {
    const sessions = [
      ...Array.from({ length: 4 }, () => buildSession({ category: 'science' })),
      buildSession({ category: 'history' }),
    ]
    const traits = computeReadingDna(sessions)
    const categoryPref = traits.find((t) => t.dimension === 'category-preference')
    expect(categoryPref?.label).toBe('Science')
    expect(categoryPref?.confidence).toBe(computeConfidence(4))
  })

  it('identifies difficulty comfort from the most-practiced difficulty', () => {
    const sessions = [
      ...Array.from({ length: 3 }, () => buildSession({ difficulty: 'hard', accuracyPercent: 85 })),
      buildSession({ difficulty: 'easy' }),
    ]
    const traits = computeReadingDna(sessions)
    const difficultyComfort = traits.find((t) => t.dimension === 'difficulty-comfort')
    expect(difficultyComfort?.label).toBe('Thrives on Challenge')
  })

  it('identifies Highly Consistent focus pattern from low accuracy variance', () => {
    const sessions = [
      buildSession({ accuracyPercent: 80 }),
      buildSession({ accuracyPercent: 82 }),
      buildSession({ accuracyPercent: 79 }),
    ]
    const traits = computeReadingDna(sessions)
    const focusPattern = traits.find((t) => t.dimension === 'focus-pattern')
    expect(focusPattern?.label).toBe('Highly Consistent')
  })

  it('identifies Needs Focus Training from high accuracy variance', () => {
    const sessions = [
      buildSession({ accuracyPercent: 20 }),
      buildSession({ accuracyPercent: 95 }),
      buildSession({ accuracyPercent: 30 }),
    ]
    const traits = computeReadingDna(sessions)
    const focusPattern = traits.find((t) => t.dimension === 'focus-pattern')
    expect(focusPattern?.label).toBe('Needs Focus Training')
  })

  it('ignores incomplete sessions', () => {
    const traits = computeReadingDna([buildSession({ completed: false })])
    for (const trait of traits) expect(trait.confidence).toBe(0)
  })
})
