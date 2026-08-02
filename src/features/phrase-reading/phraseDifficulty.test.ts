import { describe, it, expect } from 'vitest'
import { SPEED_TIERS, type DifficultyTier } from '@/types/exercise-engine'
import {
  PHRASE_READING_PROFILES,
  PHRASE_READING_LEVEL_REQUIREMENTS,
  PHRASE_READING_LEVEL_DEFAULT_TIER,
  PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT,
  getPhraseReadingProfile,
  getPhraseReadingLevelRequirement,
  phraseReadingLevel,
  phraseReadingPassPercent,
  phraseReadingPhrasesForRound,
  phraseReadingTotalPhrasesForLevel,
  PHRASE_READING_LEVEL_NAME,
  PHRASE_READING_LENGTH_LABEL,
  type PhraseReadingLevel,
} from './phraseDifficulty'

const ALL_TIERS: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive']

describe('PHRASE_READING_PROFILES', () => {
  it('defines a profile for every one of the 8 shared difficulty tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(PHRASE_READING_PROFILES[tier]).toBeDefined()
      expect(PHRASE_READING_PROFILES[tier].tier).toBe(tier)
    }
  })

  it('every msPerWord value is a real SpeedMs tier the platform supports', () => {
    for (const tier of ALL_TIERS) {
      expect(SPEED_TIERS).toContain(PHRASE_READING_PROFILES[tier].msPerWord)
    }
  })

  it('levels progress monotonically as tiers advance', () => {
    let lastLevel = 0
    for (const tier of ALL_TIERS) {
      const level = PHRASE_READING_PROFILES[tier].level
      expect(level).toBeGreaterThanOrEqual(lastLevel)
      lastLevel = level
    }
  })

  it('every level has a display name', () => {
    for (let level = 1; level <= 5; level++) {
      expect(PHRASE_READING_LEVEL_NAME[level as PhraseReadingLevel]).toBeTruthy()
    }
  })
})

describe('getPhraseReadingProfile / phraseReadingLevel', () => {
  it('are consistent with each other', () => {
    for (const tier of ALL_TIERS) {
      expect(phraseReadingLevel(tier)).toBe(getPhraseReadingProfile(tier).level)
    }
  })
})

describe('PHRASE_READING_LEVEL_REQUIREMENTS', () => {
  it('matches the locked pass requirements exactly: 2/4, 3/4, 4/5, 4/5, 5/6', () => {
    expect(PHRASE_READING_LEVEL_REQUIREMENTS[1]).toEqual({ challengesRequired: 4, passCount: 2 })
    expect(PHRASE_READING_LEVEL_REQUIREMENTS[2]).toEqual({ challengesRequired: 4, passCount: 3 })
    expect(PHRASE_READING_LEVEL_REQUIREMENTS[3]).toEqual({ challengesRequired: 5, passCount: 4 })
    expect(PHRASE_READING_LEVEL_REQUIREMENTS[4]).toEqual({ challengesRequired: 5, passCount: 4 })
    expect(PHRASE_READING_LEVEL_REQUIREMENTS[5]).toEqual({ challengesRequired: 6, passCount: 5 })
  })

  it('the pass bar rises monotonically with level', () => {
    let lastPercent = 0
    for (let level = 1; level <= 5; level++) {
      const percent = phraseReadingPassPercent(level as PhraseReadingLevel)
      expect(percent).toBeGreaterThanOrEqual(lastPercent)
      lastPercent = percent
    }
  })

  it('getPhraseReadingLevelRequirement matches the table', () => {
    for (let level = 1; level <= 5; level++) {
      expect(getPhraseReadingLevelRequirement(level as PhraseReadingLevel))
        .toEqual(PHRASE_READING_LEVEL_REQUIREMENTS[level as PhraseReadingLevel])
    }
  })
})

describe('phraseReadingPassPercent', () => {
  it('computes the exact locked percentages: 50%, 75%, 80%, 80%, 83%', () => {
    expect(phraseReadingPassPercent(1)).toBe(50)
    expect(phraseReadingPassPercent(2)).toBe(75)
    expect(phraseReadingPassPercent(3)).toBe(80)
    expect(phraseReadingPassPercent(4)).toBe(80)
    expect(phraseReadingPassPercent(5)).toBe(83)
  })
})

describe('phraseReadingPhrasesForRound', () => {
  it('shows 8 phrases for the first round of a level attempt', () => {
    expect(phraseReadingPhrasesForRound(0)).toBe(8)
  })

  it('shows 4 phrases for every round after the first', () => {
    expect(phraseReadingPhrasesForRound(1)).toBe(4)
    expect(phraseReadingPhrasesForRound(4)).toBe(4)
  })
})

describe('phraseReadingTotalPhrasesForLevel', () => {
  it('matches the scaled-down PCR rhythm totals: 20, 20, 24, 24, 28', () => {
    expect(phraseReadingTotalPhrasesForLevel(1)).toBe(20)
    expect(phraseReadingTotalPhrasesForLevel(2)).toBe(20)
    expect(phraseReadingTotalPhrasesForLevel(3)).toBe(24)
    expect(phraseReadingTotalPhrasesForLevel(4)).toBe(24)
    expect(phraseReadingTotalPhrasesForLevel(5)).toBe(28)
  })
})

describe('PHRASE_READING_LEVEL_DEFAULT_TIER', () => {
  it('maps every level to a real tier whose own level matches', () => {
    for (let level = 1; level <= 5; level++) {
      const tier = PHRASE_READING_LEVEL_DEFAULT_TIER[level as PhraseReadingLevel]
      expect(PHRASE_READING_PROFILES[tier].level).toBe(level)
    }
  })
})

describe('PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT', () => {
  it('defines the Level 5 ("Advanced Phrase Reading") percentage-based pass bar', () => {
    expect(PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT).toEqual({
      itemsPerAttempt: 2,
      questionsPerAttempt: 4,
      requiredPercent: 88,
    })
  })

  it('continues the mission\'s rising pass-bar curve as the capstone (50, 75, 80, 80, 88)', () => {
    expect(PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT.requiredPercent).toBeGreaterThan(phraseReadingPassPercent(4))
  })
})

describe('Level 4/5 display strings reflect the phrase-only restructure', () => {
  it('Level 4 is no longer named or labelled as full sentences', () => {
    expect(PHRASE_READING_LEVEL_NAME[4]).not.toMatch(/sentence/i)
    expect(PHRASE_READING_LENGTH_LABEL[4]).toBe('5 Words')
  })

  it('Level 5 is named "Advanced Phrase Reading" with a 6-8 word label', () => {
    expect(PHRASE_READING_LEVEL_NAME[5]).toBe('Advanced Phrase Reading')
    expect(PHRASE_READING_LENGTH_LABEL[5]).toBe('6-8 Words')
  })
})
