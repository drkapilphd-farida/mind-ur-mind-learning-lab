import { describe, it, expect } from 'vitest'
import { READING_MODES, readingModeDifficultyStars, getReadingMode } from './readingModes'

describe('READING_MODES', () => {
  it('defines exactly the 4 required modes', () => {
    expect(READING_MODES.map((m) => m.id)).toEqual(['learning', 'focus', 'speed', 'quantum'])
  })

  it('difficulty and target WPM both rise monotonically from Learning to Quantum', () => {
    let lastDifficulty = 0
    let lastWpm = 0
    for (const mode of READING_MODES) {
      expect(mode.difficultyLevel).toBeGreaterThanOrEqual(lastDifficulty)
      expect(mode.targetWpm).toBeGreaterThan(lastWpm)
      lastDifficulty = mode.difficultyLevel
      lastWpm = mode.targetWpm
    }
  })

  it('every mode has a non-empty description and idealFor', () => {
    for (const mode of READING_MODES) {
      expect(mode.description.length).toBeGreaterThan(0)
      expect(mode.idealFor.length).toBeGreaterThan(0)
    }
  })
})

describe('readingModeDifficultyStars', () => {
  it('fills exactly `level` stars out of 5', () => {
    expect(readingModeDifficultyStars(2)).toBe('★★☆☆☆')
    expect(readingModeDifficultyStars(4)).toBe('★★★★☆')
  })
})

describe('getReadingMode', () => {
  it('finds a real mode by id', () => {
    expect(getReadingMode('focus')?.title).toBe('Focus Mode')
  })

  it('returns null for an unknown id', () => {
    expect(getReadingMode('not-a-mode')).toBeNull()
  })
})
