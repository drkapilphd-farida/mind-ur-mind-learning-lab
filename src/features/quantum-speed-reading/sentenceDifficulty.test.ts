import { describe, it, expect } from 'vitest'
import { SPEED_TIERS, type DifficultyTier } from '@/types/exercise-engine'
import {
  SENTENCE_READING_PROFILES,
  SENTENCE_LEVEL_REQUIREMENTS,
  SENTENCE_READING_LEVEL_DEFAULT_TIER,
  getSentenceReadingProfile,
  getSentenceLevelRequirement,
  sentenceReadingLevel,
  computeSentenceLevelPassed,
  SENTENCE_READING_LEVEL_NAME,
  SENTENCE_READING_LENGTH_LABEL,
  SENTENCE_COMPLEXITY_LABEL,
  type SentenceReadingLevel,
} from './sentenceDifficulty'

const ALL_TIERS: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive']
const LEVELS: SentenceReadingLevel[] = [1, 2, 3, 4, 5]

describe('SENTENCE_READING_PROFILES', () => {
  it('defines a profile for every one of the 8 shared difficulty tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(SENTENCE_READING_PROFILES[tier]).toBeDefined()
      expect(SENTENCE_READING_PROFILES[tier].tier).toBe(tier)
    }
  })

  it('every msPerWord value is a real SpeedMs tier the platform supports', () => {
    for (const tier of ALL_TIERS) {
      expect(SPEED_TIERS).toContain(SENTENCE_READING_PROFILES[tier].msPerWord)
    }
  })

  it('levels progress monotonically as tiers advance', () => {
    let lastLevel = 0
    for (const tier of ALL_TIERS) {
      const level = SENTENCE_READING_PROFILES[tier].level
      expect(level).toBeGreaterThanOrEqual(lastLevel)
      lastLevel = level
    }
  })
})

describe('getSentenceReadingProfile / sentenceReadingLevel', () => {
  it('are consistent with each other', () => {
    for (const tier of ALL_TIERS) {
      expect(sentenceReadingLevel(tier)).toBe(getSentenceReadingProfile(tier).level)
    }
  })
})

describe('SENTENCE_LEVEL_REQUIREMENTS', () => {
  it('matches the locked word-count and pass-bar table exactly', () => {
    expect(SENTENCE_LEVEL_REQUIREMENTS[1]).toEqual({ minWords: 6, maxWords: 8, requiredPercent: 60, questionsPerAttempt: 4 })
    expect(SENTENCE_LEVEL_REQUIREMENTS[2]).toEqual({ minWords: 8, maxWords: 10, requiredPercent: 70, questionsPerAttempt: 4 })
    expect(SENTENCE_LEVEL_REQUIREMENTS[3]).toEqual({ minWords: 10, maxWords: 12, requiredPercent: 75, questionsPerAttempt: 4 })
    expect(SENTENCE_LEVEL_REQUIREMENTS[4]).toEqual({ minWords: 12, maxWords: 16, requiredPercent: 80, questionsPerAttempt: 4 })
    expect(SENTENCE_LEVEL_REQUIREMENTS[5]).toEqual({ minWords: 16, maxWords: 22, requiredPercent: 85, questionsPerAttempt: 4 })
  })

  it('the pass bar rises monotonically with level while the question count (one whole-chapter Brain Challenge) stays flat', () => {
    let lastPercent = 0
    for (const level of LEVELS) {
      const req = SENTENCE_LEVEL_REQUIREMENTS[level]
      expect(req.requiredPercent).toBeGreaterThanOrEqual(lastPercent)
      lastPercent = req.requiredPercent
      expect(req.questionsPerAttempt).toBe(4)
    }
  })

  it('word ranges never overlap and rise monotonically across levels', () => {
    let lastMax = 0
    for (const level of LEVELS) {
      const req = SENTENCE_LEVEL_REQUIREMENTS[level]
      expect(req.minWords).toBeLessThan(req.maxWords)
      expect(req.minWords).toBeGreaterThanOrEqual(lastMax)
      lastMax = req.maxWords
    }
  })

  it('getSentenceLevelRequirement matches the table', () => {
    for (const level of LEVELS) {
      expect(getSentenceLevelRequirement(level)).toEqual(SENTENCE_LEVEL_REQUIREMENTS[level])
    }
  })
})

describe('computeSentenceLevelPassed', () => {
  it('compares real percentages directly, not a forced integer ratio', () => {
    expect(computeSentenceLevelPassed(75, 70)).toBe(true)
    expect(computeSentenceLevelPassed(75, 80)).toBe(false)
    expect(computeSentenceLevelPassed(60, 60)).toBe(true)
    expect(computeSentenceLevelPassed(59, 60)).toBe(false)
  })
})

describe('SENTENCE_READING_LEVEL_DEFAULT_TIER', () => {
  it('maps every level to a real tier whose own level matches', () => {
    for (const level of LEVELS) {
      const tier = SENTENCE_READING_LEVEL_DEFAULT_TIER[level]
      expect(SENTENCE_READING_PROFILES[tier].level).toBe(level)
    }
  })
})

describe('display labels', () => {
  it('every level has a name and a sentence-length label', () => {
    for (const level of LEVELS) {
      expect(SENTENCE_READING_LEVEL_NAME[level]).toBeTruthy()
      expect(SENTENCE_READING_LENGTH_LABEL[level]).toBeTruthy()
    }
  })

  it('sentence length labels match the locked word ranges exactly', () => {
    expect(SENTENCE_READING_LENGTH_LABEL[1]).toBe('6-8 Words')
    expect(SENTENCE_READING_LENGTH_LABEL[2]).toBe('8-10 Words')
    expect(SENTENCE_READING_LENGTH_LABEL[3]).toBe('10-12 Words')
    expect(SENTENCE_READING_LENGTH_LABEL[4]).toBe('12-16 Words')
    expect(SENTENCE_READING_LENGTH_LABEL[5]).toBe('16-22 Words')
  })

  it('Sentence Complexity labels match the locked Simple/Connected/Intermediate/Advanced/Expert progression', () => {
    expect(SENTENCE_COMPLEXITY_LABEL[1]).toBe('Simple')
    expect(SENTENCE_COMPLEXITY_LABEL[2]).toBe('Connected')
    expect(SENTENCE_COMPLEXITY_LABEL[3]).toBe('Intermediate')
    expect(SENTENCE_COMPLEXITY_LABEL[4]).toBe('Advanced')
    expect(SENTENCE_COMPLEXITY_LABEL[5]).toBe('Expert')
  })
})
