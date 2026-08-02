import { describe, expect, it } from 'vitest'
import {
  GRID_SIZE,
  generateShuffledTargetSequence,
  computeStreakMultiplier,
  computeEnergyForCorrectGuess,
  BASE_ENERGY_PER_CORRECT_GUESS,
} from './quantumHiddenTargetGridDataset'

describe('generateShuffledTargetSequence', () => {
  it('produces exactly GRID_SIZE (16) entries', () => {
    expect(generateShuffledTargetSequence().length).toBe(GRID_SIZE)
    expect(GRID_SIZE).toBe(16)
  })

  it('contains every tile index from 0 to GRID_SIZE-1 exactly once', () => {
    const sequence = generateShuffledTargetSequence()
    const sorted = [...sequence].sort((a, b) => a - b)
    expect(sorted).toEqual(Array.from({ length: GRID_SIZE }, (_, i) => i))
  })

  it('produces a genuinely different order across calls (not a fixed sequence)', () => {
    const sequences = Array.from({ length: 10 }, () => generateShuffledTargetSequence().join(','))
    const uniqueOrders = new Set(sequences)
    expect(uniqueOrders.size).toBeGreaterThan(1)
  })
})

describe('computeStreakMultiplier', () => {
  it('stays at x1 for streaks 0 through 2', () => {
    expect(computeStreakMultiplier(0)).toBe(1)
    expect(computeStreakMultiplier(2)).toBe(1)
  })

  it('steps up to x2 at streak 3, x3 at streak 6', () => {
    expect(computeStreakMultiplier(3)).toBe(2)
    expect(computeStreakMultiplier(6)).toBe(3)
  })
})

describe('computeEnergyForCorrectGuess', () => {
  it('awards base energy at x1 multiplier', () => {
    expect(computeEnergyForCorrectGuess(1)).toBe(BASE_ENERGY_PER_CORRECT_GUESS)
  })

  it('awards double energy once the streak reaches the x2 tier', () => {
    expect(computeEnergyForCorrectGuess(3)).toBe(BASE_ENERGY_PER_CORRECT_GUESS * 2)
  })
})
