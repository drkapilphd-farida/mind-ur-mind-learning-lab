import { describe, it, expect } from 'vitest'
import { SPEED_TIERS, type DifficultyTier } from '@/types/exercise-engine'
import {
  PROGRESSIVE_CHUNK_READING_PROFILES,
  PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS,
  PROGRESSIVE_CHUNK_READING_LEVEL_DEFAULT_TIER,
  getProgressiveChunkReadingProfile,
  getProgressiveChunkReadingLevelRequirement,
  progressiveChunkReadingLevel,
  progressiveChunkReadingTargetWpm,
  progressiveChunkReadingQuestionPrompt,
  progressiveChunkReadingPassPercent,
  progressiveChunkReadingChunksForRound,
  PROGRESSIVE_CHUNK_READING_LEVEL_NAME,
  type ProgressiveChunkReadingLevel,
} from './progressiveChunkReadingDifficulty'

const ALL_TIERS: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive']

describe('PROGRESSIVE_CHUNK_READING_PROFILES', () => {
  it('defines a profile for every one of the 8 shared difficulty tiers', () => {
    for (const tier of ALL_TIERS) {
      expect(PROGRESSIVE_CHUNK_READING_PROFILES[tier]).toBeDefined()
      expect(PROGRESSIVE_CHUNK_READING_PROFILES[tier].tier).toBe(tier)
    }
  })

  it('every msPerWord value is a real SpeedMs tier the platform supports', () => {
    for (const tier of ALL_TIERS) {
      expect(SPEED_TIERS).toContain(PROGRESSIVE_CHUNK_READING_PROFILES[tier].msPerWord)
    }
  })

  it('levels progress monotonically as tiers advance (never a later tier mapping to an earlier level)', () => {
    let lastLevel = 0
    for (const tier of ALL_TIERS) {
      const level = PROGRESSIVE_CHUNK_READING_PROFILES[tier].level
      expect(level).toBeGreaterThanOrEqual(lastLevel)
      lastLevel = level
    }
  })

  it('Levels 1-3 draw only from the chunk pool; Level 4 only from reading-phrase; Level 5 mixes both', () => {
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.beginner.contentTypes).toEqual(['chunk'])
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.easy.contentTypes).toEqual(['chunk'])
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.medium.contentTypes).toEqual(['chunk'])
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.advanced.contentTypes).toEqual(['reading-phrase'])
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.expert.contentTypes).toEqual(['reading-phrase'])
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.elite.contentTypes).toEqual(expect.arrayContaining(['chunk', 'reading-phrase']))
    expect(PROGRESSIVE_CHUNK_READING_PROFILES.master.contentTypes).toEqual(expect.arrayContaining(['chunk', 'reading-phrase']))
  })

  it('every level has a display name', () => {
    for (let level = 1; level <= 5; level++) {
      expect(PROGRESSIVE_CHUNK_READING_LEVEL_NAME[level as 1 | 2 | 3 | 4 | 5]).toBeTruthy()
    }
  })
})

describe('getProgressiveChunkReadingProfile / progressiveChunkReadingLevel', () => {
  it('are consistent with each other', () => {
    for (const tier of ALL_TIERS) {
      expect(progressiveChunkReadingLevel(tier)).toBe(getProgressiveChunkReadingProfile(tier).level)
    }
  })
})

describe('progressiveChunkReadingTargetWpm', () => {
  it('computes real words-per-minute from milliseconds-per-word', () => {
    expect(progressiveChunkReadingTargetWpm(500)).toBe(120)
    expect(progressiveChunkReadingTargetWpm(200)).toBe(300)
  })
})

describe('progressiveChunkReadingQuestionPrompt', () => {
  it('uses chunk-flavored phrasing for Levels 1-3 and phrase-flavored phrasing for Levels 4-5', () => {
    const chunkPrompts = new Set(['Which word group appeared in this block?', 'Which chunk appeared exactly?', 'Select the exact chunk.'])
    const phrasePrompts = new Set(['Which phrase appeared in this block?', 'Which phrase was flashed?', 'Select the exact phrase.'])
    for (let seed = 0; seed < 10; seed++) {
      expect(chunkPrompts.has(progressiveChunkReadingQuestionPrompt('beginner', seed))).toBe(true)
      expect(chunkPrompts.has(progressiveChunkReadingQuestionPrompt('medium', seed))).toBe(true)
      expect(phrasePrompts.has(progressiveChunkReadingQuestionPrompt('advanced', seed))).toBe(true)
      expect(phrasePrompts.has(progressiveChunkReadingQuestionPrompt('master', seed))).toBe(true)
    }
  })

  it('is deterministic for a given tier + seed', () => {
    expect(progressiveChunkReadingQuestionPrompt('beginner', 5)).toBe(progressiveChunkReadingQuestionPrompt('beginner', 5))
  })

  it('varies across seeds (randomized wording, not the same prompt every time)', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 20; seed++) seen.add(progressiveChunkReadingQuestionPrompt('beginner', seed))
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS', () => {
  it('matches the locked pass requirements exactly: 2/4, 3/4, 4/5, 4/5, 5/6', () => {
    expect(PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[1]).toEqual({ challengesRequired: 4, passCount: 2 })
    expect(PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[2]).toEqual({ challengesRequired: 4, passCount: 3 })
    expect(PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[3]).toEqual({ challengesRequired: 5, passCount: 4 })
    expect(PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[4]).toEqual({ challengesRequired: 5, passCount: 4 })
    expect(PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[5]).toEqual({ challengesRequired: 6, passCount: 5 })
  })

  it('the pass bar rises monotonically with level (never gets easier at a higher level)', () => {
    let lastPercent = 0
    for (let level = 1; level <= 5; level++) {
      const percent = progressiveChunkReadingPassPercent(level as ProgressiveChunkReadingLevel)
      expect(percent).toBeGreaterThanOrEqual(lastPercent)
      lastPercent = percent
    }
  })

  it('getProgressiveChunkReadingLevelRequirement matches the table', () => {
    for (let level = 1; level <= 5; level++) {
      expect(getProgressiveChunkReadingLevelRequirement(level as ProgressiveChunkReadingLevel))
        .toEqual(PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[level as ProgressiveChunkReadingLevel])
    }
  })
})

describe('progressiveChunkReadingPassPercent', () => {
  it('computes the exact locked percentages: 50%, 75%, 80%, 80%, 83%', () => {
    expect(progressiveChunkReadingPassPercent(1)).toBe(50)
    expect(progressiveChunkReadingPassPercent(2)).toBe(75)
    expect(progressiveChunkReadingPassPercent(3)).toBe(80)
    expect(progressiveChunkReadingPassPercent(4)).toBe(80)
    expect(progressiveChunkReadingPassPercent(5)).toBe(83)
  })
})

describe('progressiveChunkReadingChunksForRound', () => {
  it('shows 20 chunks for the first round of a level attempt', () => {
    expect(progressiveChunkReadingChunksForRound(0)).toBe(20)
  })

  it('shows 10 chunks for every round after the first', () => {
    expect(progressiveChunkReadingChunksForRound(1)).toBe(10)
    expect(progressiveChunkReadingChunksForRound(4)).toBe(10)
  })
})

describe('PROGRESSIVE_CHUNK_READING_LEVEL_DEFAULT_TIER', () => {
  it('maps every level to a real tier whose own level matches', () => {
    for (let level = 1; level <= 5; level++) {
      const tier = PROGRESSIVE_CHUNK_READING_LEVEL_DEFAULT_TIER[level as ProgressiveChunkReadingLevel]
      expect(PROGRESSIVE_CHUNK_READING_PROFILES[tier].level).toBe(level)
    }
  })
})
