import { describe, expect, it } from 'vitest'
import {
  COLOR_PALETTE,
  ROUNDS_PER_SESSION,
  buildRound,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getColorSwatch,
  BASE_POINTS_PER_CORRECT_MATCH,
  TIMING_BONUS_WINDOW_MS,
  TIMING_BONUS_POINTS,
} from './hemisphericColorSyncDataset'

describe('COLOR_PALETTE', () => {
  it('defines 6 distinct colors, each with a unique name and hex', () => {
    expect(COLOR_PALETTE.length).toBe(6)
    expect(new Set(COLOR_PALETTE.map((c) => c.name)).size).toBe(6)
    expect(new Set(COLOR_PALETTE.map((c) => c.hex)).size).toBe(6)
  })

  it('getColorSwatch resolves every palette name', () => {
    for (const swatch of COLOR_PALETTE) {
      expect(getColorSwatch(swatch.name)).toEqual(swatch)
    }
  })
})

describe('buildRound', () => {
  it('always produces a genuine Stroop conflict — ink color never matches the word', () => {
    for (let i = 0; i < 50; i += 1) {
      const round = buildRound(i % 2 === 0 ? 'word' : 'ink')
      expect(round.inkColorName).not.toBe(round.wordColorName)
    }
  })

  it('the correct answer matches the prompted mode exactly', () => {
    for (let i = 0; i < 50; i += 1) {
      const wordRound = buildRound('word')
      expect(wordRound.correctColorName).toBe(wordRound.wordColorName)

      const inkRound = buildRound('ink')
      expect(inkRound.correctColorName).toBe(inkRound.inkColorName)
    }
  })

  it('produces exactly 4 unique options including the correct answer and the trap (the other of word/ink)', () => {
    for (let i = 0; i < 50; i += 1) {
      const round = buildRound(i % 2 === 0 ? 'word' : 'ink')
      expect(round.optionColorNames.length).toBe(4)
      expect(new Set(round.optionColorNames).size).toBe(4)
      expect(round.optionColorNames).toContain(round.correctColorName)
      expect(round.optionColorNames).toContain(round.wordColorName)
      expect(round.optionColorNames).toContain(round.inkColorName)
    }
  })
})

describe('buildSessionRounds', () => {
  it('produces exactly ROUNDS_PER_SESSION (16) rounds', () => {
    const rounds = buildSessionRounds()
    expect(ROUNDS_PER_SESSION).toBe(16)
    expect(rounds.length).toBe(16)
  })

  it('splits exactly half word-prompts and half ink-prompts, never left to chance', () => {
    const rounds = buildSessionRounds()
    const wordCount = rounds.filter((r) => r.promptMode === 'word').length
    const inkCount = rounds.filter((r) => r.promptMode === 'ink').length
    expect(wordCount).toBe(8)
    expect(inkCount).toBe(8)
  })

  it('every round in the session is a genuine conflict with 4 unique options', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      expect(round.inkColorName).not.toBe(round.wordColorName)
      expect(new Set(round.optionColorNames).size).toBe(4)
    }
  })
})

describe('computeStreakMultiplier', () => {
  it('stays at x1 for streaks 0-1, steps to x2 at streak 2', () => {
    expect(computeStreakMultiplier(0)).toBe(1)
    expect(computeStreakMultiplier(1)).toBe(1)
    expect(computeStreakMultiplier(2)).toBe(2)
  })
})

describe('computePointsForCorrectMatch', () => {
  it('awards base points at x1 with no timing bonus when slow', () => {
    expect(computePointsForCorrectMatch(1, TIMING_BONUS_WINDOW_MS + 200)).toBe(BASE_POINTS_PER_CORRECT_MATCH)
  })

  it('adds the timing bonus when the reaction is within the fast window', () => {
    expect(computePointsForCorrectMatch(1, 100)).toBe(BASE_POINTS_PER_CORRECT_MATCH + TIMING_BONUS_POINTS)
  })

  it('applies both the streak multiplier and the timing bonus together', () => {
    expect(computePointsForCorrectMatch(2, 100)).toBe(BASE_POINTS_PER_CORRECT_MATCH * 2 + TIMING_BONUS_POINTS)
  })
})
