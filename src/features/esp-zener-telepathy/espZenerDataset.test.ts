import { describe, expect, it } from 'vitest'
import {
  ZENER_SYMBOLS,
  ZENER_DECK_SIZE,
  generateShuffledZenerDeck,
  computeStreakMultiplier,
  computePointsForCorrectGuess,
  BASE_POINTS_PER_CORRECT_GUESS,
} from './espZenerDataset'

describe('generateShuffledZenerDeck', () => {
  it('produces exactly ZENER_DECK_SIZE (25) cards', () => {
    expect(generateShuffledZenerDeck().length).toBe(ZENER_DECK_SIZE)
    expect(ZENER_DECK_SIZE).toBe(25)
  })

  it('contains exactly 5 copies of every symbol', () => {
    const deck = generateShuffledZenerDeck()
    for (const symbol of ZENER_SYMBOLS) {
      const count = deck.filter((id) => id === symbol.id).length
      expect(count).toBe(5)
    }
  })

  it('produces a genuinely different order across calls (not a fixed sequence)', () => {
    const decks = Array.from({ length: 10 }, () => generateShuffledZenerDeck().join(','))
    const uniqueOrders = new Set(decks)
    expect(uniqueOrders.size).toBeGreaterThan(1)
  })
})

describe('computeStreakMultiplier', () => {
  it('stays at x1 for streaks 0 through 2', () => {
    expect(computeStreakMultiplier(0)).toBe(1)
    expect(computeStreakMultiplier(1)).toBe(1)
    expect(computeStreakMultiplier(2)).toBe(1)
  })

  it('steps up to x2 at streak 3, x3 at streak 6', () => {
    expect(computeStreakMultiplier(3)).toBe(2)
    expect(computeStreakMultiplier(5)).toBe(2)
    expect(computeStreakMultiplier(6)).toBe(3)
  })
})

describe('computePointsForCorrectGuess', () => {
  it('awards base points at x1 multiplier', () => {
    expect(computePointsForCorrectGuess(1)).toBe(BASE_POINTS_PER_CORRECT_GUESS)
  })

  it('awards double points once the streak reaches the x2 tier', () => {
    expect(computePointsForCorrectGuess(3)).toBe(BASE_POINTS_PER_CORRECT_GUESS * 2)
  })
})
