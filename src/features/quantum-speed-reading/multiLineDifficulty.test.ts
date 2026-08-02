import { describe, it, expect } from 'vitest'
import { SPEED_TIERS, type DifficultyTier } from '@/types/exercise-engine'
import {
  MULTI_LINE_READING_PROFILES,
  MULTI_LINE_LEVEL_REQUIREMENTS,
  MULTI_LINE_READING_LEVEL_DEFAULT_TIER,
  getMultiLineReadingProfile,
  getMultiLineLevelRequirement,
  multiLineReadingLevel,
  computeMultiLineLevelPassed,
  MULTI_LINE_READING_LEVEL_NAME,
  MULTI_LINE_READING_SIZE_LABEL,
  type MultiLineReadingLevel,
} from './multiLineDifficulty'

const ALL_TIERS: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive']
const LEVELS: MultiLineReadingLevel[] = [1, 2, 3, 4, 5]

describe('MULTI_LINE_READING_PROFILES', () => {
  it('defines a profile for every one of the 8 shared difficulty tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(MULTI_LINE_READING_PROFILES[tier]).toBeDefined()
      expect(MULTI_LINE_READING_PROFILES[tier].tier).toBe(tier)
    }
  })

  it('every msPerWord value is a real SpeedMs tier the platform supports', () => {
    for (const tier of ALL_TIERS) {
      expect(SPEED_TIERS).toContain(MULTI_LINE_READING_PROFILES[tier].msPerWord)
    }
  })

  it('levels progress monotonically as tiers advance', () => {
    let lastLevel = 0
    for (const tier of ALL_TIERS) {
      const level = MULTI_LINE_READING_PROFILES[tier].level
      expect(level).toBeGreaterThanOrEqual(lastLevel)
      lastLevel = level
    }
  })
})

describe('getMultiLineReadingProfile / multiLineReadingLevel', () => {
  it('are consistent with each other', () => {
    for (const tier of ALL_TIERS) {
      expect(multiLineReadingLevel(tier)).toBe(getMultiLineReadingProfile(tier).level)
    }
  })
})

describe('MULTI_LINE_LEVEL_REQUIREMENTS', () => {
  it('matches the locked line-count and pass-bar table exactly', () => {
    expect(MULTI_LINE_LEVEL_REQUIREMENTS[1]).toEqual({ lineCount: 4, requiredPercent: 60, paragraphsPerAttempt: 2, questionsPerAttempt: 4 })
    expect(MULTI_LINE_LEVEL_REQUIREMENTS[2]).toEqual({ lineCount: 5, requiredPercent: 70, paragraphsPerAttempt: 2, questionsPerAttempt: 4 })
    expect(MULTI_LINE_LEVEL_REQUIREMENTS[3]).toEqual({ lineCount: 6, requiredPercent: 80, paragraphsPerAttempt: 2, questionsPerAttempt: 4 })
    expect(MULTI_LINE_LEVEL_REQUIREMENTS[4]).toEqual({ lineCount: 7, requiredPercent: 85, paragraphsPerAttempt: 2, questionsPerAttempt: 4 })
    expect(MULTI_LINE_LEVEL_REQUIREMENTS[5]).toEqual({ lineCount: 8, requiredPercent: 90, paragraphsPerAttempt: 2, questionsPerAttempt: 4 })
  })

  it('the pass bar rises monotonically with level while round/question counts stay flat', () => {
    let lastPercent = 0
    for (const level of LEVELS) {
      const req = MULTI_LINE_LEVEL_REQUIREMENTS[level]
      expect(req.requiredPercent).toBeGreaterThanOrEqual(lastPercent)
      lastPercent = req.requiredPercent
      expect(req.paragraphsPerAttempt).toBe(2)
      expect(req.questionsPerAttempt).toBe(4)
    }
  })

  it('getMultiLineLevelRequirement matches the table', () => {
    for (const level of LEVELS) {
      expect(getMultiLineLevelRequirement(level)).toEqual(MULTI_LINE_LEVEL_REQUIREMENTS[level])
    }
  })

  it('line count rises by exactly one line per level (4 through 8)', () => {
    for (const level of LEVELS) {
      expect(MULTI_LINE_LEVEL_REQUIREMENTS[level].lineCount).toBe(level + 3)
    }
  })
})

describe('computeMultiLineLevelPassed', () => {
  it('compares real percentages directly, not a forced integer ratio', () => {
    expect(computeMultiLineLevelPassed(75, 70)).toBe(true)
    expect(computeMultiLineLevelPassed(75, 80)).toBe(false)
    expect(computeMultiLineLevelPassed(60, 60)).toBe(true)
    expect(computeMultiLineLevelPassed(59, 60)).toBe(false)
  })

  it('matches the locked bars: 3/4=75% passes Level 2 (70%) but fails Level 3 (80%)', () => {
    const threeOfFourPercent = Math.round((3 / 4) * 100)
    expect(computeMultiLineLevelPassed(threeOfFourPercent, MULTI_LINE_LEVEL_REQUIREMENTS[2].requiredPercent)).toBe(true)
    expect(computeMultiLineLevelPassed(threeOfFourPercent, MULTI_LINE_LEVEL_REQUIREMENTS[3].requiredPercent)).toBe(false)
  })
})

describe('MULTI_LINE_READING_LEVEL_DEFAULT_TIER', () => {
  it('maps every level to a real tier whose own level matches', () => {
    for (const level of LEVELS) {
      const tier = MULTI_LINE_READING_LEVEL_DEFAULT_TIER[level]
      expect(MULTI_LINE_READING_PROFILES[tier].level).toBe(level)
    }
  })
})

describe('display labels', () => {
  it('every level has a name and a paragraph-size label', () => {
    for (const level of LEVELS) {
      expect(MULTI_LINE_READING_LEVEL_NAME[level]).toBeTruthy()
      expect(MULTI_LINE_READING_SIZE_LABEL[level]).toBeTruthy()
    }
  })
})
