import { describe, it, expect } from 'vitest'
import type { DifficultyTier } from '@/types/exercise-engine'
import {
  paragraphLevelForMission,
  PARAGRAPH_LEVEL_REQUIREMENTS,
  PARAGRAPH_MISSION_REQUIREMENTS,
  getParagraphMissionRequirement,
  computeParagraphMissionPassed,
  PARAGRAPH_READING_MS_PER_WORD,
  PARAGRAPH_READING_TIER_STARTING_MISSION,
  paragraphReadingStartingMission,
  PARAGRAPH_READING_LEVEL_DEFAULT_TIER,
  PARAGRAPH_READING_LEVEL_NAME,
  PARAGRAPH_READING_LENGTH_LABEL,
  paragraphDifficultyStars,
  type ParagraphReadingLevel,
} from './paragraphDifficulty'

const ALL_TIERS: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive']
const LEVELS: ParagraphReadingLevel[] = [1, 2, 3, 4, 5]

describe('paragraphLevelForMission', () => {
  it('reconciles "Mission 1 of 20" with the 5-level word-count table: 4 missions per level', () => {
    expect(paragraphLevelForMission(1)).toBe(1)
    expect(paragraphLevelForMission(4)).toBe(1)
    expect(paragraphLevelForMission(5)).toBe(2)
    expect(paragraphLevelForMission(8)).toBe(2)
    expect(paragraphLevelForMission(9)).toBe(3)
    expect(paragraphLevelForMission(12)).toBe(3)
    expect(paragraphLevelForMission(13)).toBe(4)
    expect(paragraphLevelForMission(16)).toBe(4)
    expect(paragraphLevelForMission(17)).toBe(5)
    expect(paragraphLevelForMission(20)).toBe(5)
  })

  it('never returns a level outside 1-5 for any mission in range', () => {
    for (let mission = 1; mission <= 20; mission++) {
      const level = paragraphLevelForMission(mission)
      expect(level).toBeGreaterThanOrEqual(1)
      expect(level).toBeLessThanOrEqual(5)
    }
  })
})

describe('PARAGRAPH_LEVEL_REQUIREMENTS', () => {
  it('matches the locked word-count and pass-bar table exactly', () => {
    expect(PARAGRAPH_LEVEL_REQUIREMENTS[1]).toEqual({ targetWords: 120, requiredPercent: 60 })
    expect(PARAGRAPH_LEVEL_REQUIREMENTS[2]).toEqual({ targetWords: 150, requiredPercent: 70 })
    expect(PARAGRAPH_LEVEL_REQUIREMENTS[3]).toEqual({ targetWords: 180, requiredPercent: 75 })
    expect(PARAGRAPH_LEVEL_REQUIREMENTS[4]).toEqual({ targetWords: 220, requiredPercent: 80 })
    expect(PARAGRAPH_LEVEL_REQUIREMENTS[5]).toEqual({ targetWords: 260, requiredPercent: 85 })
  })

  it('word counts and pass bars rise monotonically with level', () => {
    let lastWords = 0
    let lastPercent = 0
    for (const level of LEVELS) {
      const req = PARAGRAPH_LEVEL_REQUIREMENTS[level]
      expect(req.targetWords).toBeGreaterThan(lastWords)
      expect(req.requiredPercent).toBeGreaterThanOrEqual(lastPercent)
      lastWords = req.targetWords
      lastPercent = req.requiredPercent
    }
  })
})

describe('PARAGRAPH_MISSION_REQUIREMENTS', () => {
  it('has exactly 20 entries, one per mission', () => {
    expect(Object.keys(PARAGRAPH_MISSION_REQUIREMENTS)).toHaveLength(20)
  })

  it('every mission requirement matches its derived level requirement', () => {
    for (let mission = 1; mission <= 20; mission++) {
      const level = paragraphLevelForMission(mission)
      const req = getParagraphMissionRequirement(mission)
      expect(req.level).toBe(level)
      expect(req.targetWords).toBe(PARAGRAPH_LEVEL_REQUIREMENTS[level].targetWords)
      expect(req.requiredPercent).toBe(PARAGRAPH_LEVEL_REQUIREMENTS[level].requiredPercent)
    }
  })
})

describe('computeParagraphMissionPassed', () => {
  it('compares real percentages directly, not a forced integer ratio', () => {
    expect(computeParagraphMissionPassed(75, 70)).toBe(true)
    expect(computeParagraphMissionPassed(75, 80)).toBe(false)
    expect(computeParagraphMissionPassed(60, 60)).toBe(true)
    expect(computeParagraphMissionPassed(59, 60)).toBe(false)
  })
})

describe('PARAGRAPH_READING_MS_PER_WORD', () => {
  it('defines a pace for every one of the 8 shared difficulty tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(PARAGRAPH_READING_MS_PER_WORD[tier]).toBeGreaterThan(0)
    }
  })
})

describe('PARAGRAPH_READING_TIER_STARTING_MISSION / paragraphReadingStartingMission', () => {
  it('is monotonic across the 8 tiers and stays within 1-20', () => {
    let lastMission = 0
    for (const tier of ALL_TIERS) {
      const mission = paragraphReadingStartingMission(tier)
      expect(mission).toBeGreaterThanOrEqual(1)
      expect(mission).toBeLessThanOrEqual(20)
      expect(mission).toBeGreaterThanOrEqual(lastMission)
      lastMission = mission
    }
  })

  it('are consistent with each other', () => {
    for (const tier of ALL_TIERS) {
      expect(paragraphReadingStartingMission(tier)).toBe(PARAGRAPH_READING_TIER_STARTING_MISSION[tier])
    }
  })
})

describe('PARAGRAPH_READING_LEVEL_DEFAULT_TIER', () => {
  it('maps every level to a real tier', () => {
    for (const level of LEVELS) {
      expect(ALL_TIERS).toContain(PARAGRAPH_READING_LEVEL_DEFAULT_TIER[level])
    }
  })
})

describe('display labels', () => {
  it('every level has a name and a length label', () => {
    for (const level of LEVELS) {
      expect(PARAGRAPH_READING_LEVEL_NAME[level]).toBeTruthy()
      expect(PARAGRAPH_READING_LENGTH_LABEL[level]).toBeTruthy()
    }
  })
})

describe('paragraphDifficultyStars', () => {
  it('matches the brief\'s own "★★☆☆☆"-style example at Level 2', () => {
    expect(paragraphDifficultyStars(2)).toBe('★★☆☆☆')
  })

  it('fills exactly `level` stars out of 5 for every level', () => {
    for (const level of LEVELS) {
      const stars = paragraphDifficultyStars(level)
      expect(stars).toHaveLength(5)
      expect(stars.split('★').length - 1).toBe(level)
      expect(stars.split('☆').length - 1).toBe(5 - level)
    }
  })
})
