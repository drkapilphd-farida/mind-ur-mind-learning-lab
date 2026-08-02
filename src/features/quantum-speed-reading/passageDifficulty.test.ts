import { describe, it, expect } from 'vitest'
import {
  PASSAGE_MS_PER_WORD,
  PASSAGE_DIFFICULTY_LABEL,
  PASSAGE_CATEGORY_LABEL,
  estimateWpm,
  estimateReadingTimeSec,
  formatReadingTime,
  type PassageDifficulty,
} from './passageDifficulty'

const DIFFICULTIES: readonly PassageDifficulty[] = ['easy', 'medium', 'hard']

describe('PASSAGE_MS_PER_WORD / estimateWpm', () => {
  it('defines a pace for all 3 real difficulties (never for Adaptive, which has no content yet)', () => {
    for (const difficulty of DIFFICULTIES) {
      expect(PASSAGE_MS_PER_WORD[difficulty]).toBeGreaterThan(0)
    }
  })

  it('WPM rises monotonically as difficulty increases', () => {
    expect(estimateWpm('easy')).toBeLessThan(estimateWpm('medium'))
    expect(estimateWpm('medium')).toBeLessThan(estimateWpm('hard'))
  })

  it('matches the locked pacing table exactly', () => {
    expect(estimateWpm('easy')).toBe(200)
    expect(estimateWpm('medium')).toBe(250)
    expect(estimateWpm('hard')).toBe(300)
  })
})

describe('estimateReadingTimeSec', () => {
  it('computes real elapsed time from word count and pace', () => {
    // 200 words at easy (300ms/word) = 60000ms = 60s
    expect(estimateReadingTimeSec(200, 'easy')).toBe(60)
  })

  it('a longer passage at the same difficulty takes longer', () => {
    expect(estimateReadingTimeSec(200, 'medium')).toBeGreaterThan(estimateReadingTimeSec(100, 'medium'))
  })
})

describe('formatReadingTime', () => {
  it('formats sub-minute durations as seconds', () => {
    expect(formatReadingTime(45)).toBe('45s')
  })

  it('formats exact minutes without a seconds remainder', () => {
    expect(formatReadingTime(120)).toBe('2 min')
  })

  it('formats minutes with a remainder', () => {
    expect(formatReadingTime(90)).toBe('1 min 30s')
  })
})

describe('display labels', () => {
  it('every difficulty and category has a label', () => {
    for (const difficulty of DIFFICULTIES) {
      expect(PASSAGE_DIFFICULTY_LABEL[difficulty]).toBeTruthy()
    }
    for (const category of Object.keys(PASSAGE_CATEGORY_LABEL)) {
      expect(PASSAGE_CATEGORY_LABEL[category as keyof typeof PASSAGE_CATEGORY_LABEL]).toBeTruthy()
    }
  })
})
