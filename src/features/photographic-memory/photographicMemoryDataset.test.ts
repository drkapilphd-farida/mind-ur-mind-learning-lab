import { describe, expect, it } from 'vitest'
import {
  ROUNDS_PER_SESSION,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectGuess,
  BASE_POINTS_PER_CORRECT_GUESS,
  type PhotographicMemoryCategory,
} from './photographicMemoryDataset'

const ALL_CATEGORIES: readonly PhotographicMemoryCategory[] = ['mandala', 'icon-cluster', 'flash-matrix', 'color-shape']

describe('buildSessionRounds', () => {
  it('produces exactly ROUNDS_PER_SESSION (10) rounds for the "all" filter', () => {
    const rounds = buildSessionRounds('all')
    expect(rounds.length).toBe(ROUNDS_PER_SESSION)
    expect(ROUNDS_PER_SESSION).toBe(10)
  })

  it('cycles through every category at least twice in a 10-round "all" session', () => {
    const rounds = buildSessionRounds('all')
    const counts = new Map<PhotographicMemoryCategory, number>()
    for (const round of rounds) {
      counts.set(round.category, (counts.get(round.category) ?? 0) + 1)
    }
    for (const category of ALL_CATEGORIES) {
      expect(counts.get(category) ?? 0).toBeGreaterThanOrEqual(2)
    }
  })

  it('locks every round to the requested category when a specific filter is given', () => {
    for (const category of ALL_CATEGORIES) {
      const rounds = buildSessionRounds(category)
      expect(rounds.length).toBe(ROUNDS_PER_SESSION)
      for (const round of rounds) {
        expect(round.category).toBe(category)
      }
    }
  })

  it('every round has a correctOptionId present among its 4 options', () => {
    const rounds = buildSessionRounds('all')
    for (const round of rounds) {
      expect(round.options.length).toBe(4)
      expect(round.options.some((option) => option.optionId === round.correctOptionId)).toBe(true)
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

describe('computePointsForCorrectGuess', () => {
  it('awards base points (150) at x1, double at the x2 tier', () => {
    expect(BASE_POINTS_PER_CORRECT_GUESS).toBe(150)
    expect(computePointsForCorrectGuess(1)).toBe(150)
    expect(computePointsForCorrectGuess(2)).toBe(300)
  })
})
