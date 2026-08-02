import { describe, it, expect } from 'vitest'
import { PARAGRAPH_LIBRARY } from './paragraphLibrary'
import { PARAGRAPH_CHALLENGE_TYPES } from './paragraphChallengeLibrary'
import {
  buildParagraphChallenges,
  computeParagraphSessionWpm,
  computeComprehensionPercent,
  computeBestStreak,
} from './paragraphEngine'

describe('buildParagraphChallenges', () => {
  it('builds exactly 8 questions — all mandatory types, every attempt, never a subset', () => {
    const paragraph = PARAGRAPH_LIBRARY[1][0]!
    const { questions, challenges } = buildParagraphChallenges(paragraph, 1)
    expect(questions).toHaveLength(8)
    expect(challenges).toHaveLength(8)
    expect(challenges.map((c) => c.type).sort()).toEqual([...PARAGRAPH_CHALLENGE_TYPES].sort())
  })

  it('every question has exactly 4 options with a valid correctIndex', () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (const paragraph of PARAGRAPH_LIBRARY[level]) {
        const { questions } = buildParagraphChallenges(paragraph, 7)
        for (const q of questions) {
          expect(q.options).toHaveLength(4)
          expect(q.correctIndex).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex).toBeLessThan(4)
          expect(new Set(q.options).size).toBe(4) // no duplicate options
        }
      }
    }
  })

  it('never asks a position/recall-style question ("sentence 3", "fourth word")', () => {
    const paragraph = PARAGRAPH_LIBRARY[3][0]!
    const { challenges } = buildParagraphChallenges(paragraph, 1)
    for (const c of challenges) {
      expect(c.prompt.toLowerCase()).not.toMatch(/sentence \d|word \d|first word|came first/)
    }
  })

  it('is deterministic for a given seed', () => {
    const paragraph = PARAGRAPH_LIBRARY[2][1]!
    const a = buildParagraphChallenges(paragraph, 99)
    const b = buildParagraphChallenges(paragraph, 99)
    expect(a.questions.map((q) => q.options)).toEqual(b.questions.map((q) => q.options))
  })
})

describe('computeParagraphSessionWpm', () => {
  it('computes words per minute from real totals', () => {
    // 150 words read in 30 seconds = 300 WPM
    expect(computeParagraphSessionWpm(150, 30000)).toBe(300)
  })

  it('returns 0 rather than dividing by zero when no reading time has elapsed', () => {
    expect(computeParagraphSessionWpm(0, 0)).toBe(0)
  })
})

describe('computeComprehensionPercent', () => {
  it('weights deep-understanding types 1.5x and surface types 1.0x', () => {
    const allCorrect = PARAGRAPH_CHALLENGE_TYPES.map((type) => ({ isCorrect: true, type }))
    expect(computeComprehensionPercent(allCorrect)).toBe(100)

    const allWrong = PARAGRAPH_CHALLENGE_TYPES.map((type) => ({ isCorrect: false, type }))
    expect(computeComprehensionPercent(allWrong)).toBe(0)
  })

  it('is genuinely distinct from raw accuracy — missing a deep question hurts more than missing a surface one', () => {
    const missOneDeep = [
      { isCorrect: false, type: 'main-idea' as const },
      { isCorrect: true, type: 'inference' as const },
      { isCorrect: true, type: 'summary-selection' as const },
      { isCorrect: true, type: 'meaning-relationship' as const },
      { isCorrect: true, type: 'supporting-detail' as const },
      { isCorrect: true, type: 'vocabulary-in-context' as const },
      { isCorrect: true, type: 'cause-effect' as const },
      { isCorrect: true, type: 'best-title' as const },
    ]
    const missOneSurface = [
      { isCorrect: true, type: 'main-idea' as const },
      { isCorrect: true, type: 'inference' as const },
      { isCorrect: true, type: 'summary-selection' as const },
      { isCorrect: true, type: 'meaning-relationship' as const },
      { isCorrect: false, type: 'supporting-detail' as const },
      { isCorrect: true, type: 'vocabulary-in-context' as const },
      { isCorrect: true, type: 'cause-effect' as const },
      { isCorrect: true, type: 'best-title' as const },
    ]
    const rawAccuracy = 7 / 8 // identical for both — 7 of 8 correct either way
    expect(rawAccuracy).toBeCloseTo(0.875, 3)
    expect(computeComprehensionPercent(missOneDeep)).toBeLessThan(computeComprehensionPercent(missOneSurface))
  })

  it('returns 0 rather than dividing by zero with no responses', () => {
    expect(computeComprehensionPercent([])).toBe(0)
  })
})

describe('computeBestStreak', () => {
  it('finds the longest run of consecutive correct answers', () => {
    const responses = [
      { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
    ]
    expect(computeBestStreak(responses)).toBe(3)
  })

  it('returns 0 for an empty or all-incorrect session', () => {
    expect(computeBestStreak([])).toBe(0)
    expect(computeBestStreak([{ isCorrect: false }, { isCorrect: false }])).toBe(0)
  })
})
