import { describe, expect, it } from 'vitest'
import {
  ESSENCE_THEMES,
  ROUNDS_PER_SESSION,
  MAX_LIVES,
  buildSessionRounds,
  buildEssenceOptions,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  BASE_POINTS_PER_CORRECT_MATCH,
  TIMING_BONUS_WINDOW_MS,
  TIMING_BONUS_POINTS,
} from './pictorialEssenceSprintDataset'

describe('ESSENCE_THEMES', () => {
  it('defines 64 distinct themes, 8 per category across 8 categories (a massive expansion from the original 30)', () => {
    expect(ESSENCE_THEMES.length).toBe(64)
    const ids = new Set(ESSENCE_THEMES.map((theme) => theme.id))
    expect(ids.size).toBe(64)

    const counts = new Map<string, number>()
    for (const theme of ESSENCE_THEMES) {
      counts.set(theme.category, (counts.get(theme.category) ?? 0) + 1)
    }
    expect(counts.size).toBe(8)
    for (const count of counts.values()) {
      expect(count).toBe(8)
    }
  })

  it('includes the explicitly required abstract and symbolic categories', () => {
    const categories = new Set(ESSENCE_THEMES.map((theme) => theme.category))
    expect(categories.has('abstract')).toBe(true)
    expect(categories.has('symbolic')).toBe(true)
  })
})

describe('MAX_LIVES', () => {
  it('is the arcade 3-lives system', () => {
    expect(MAX_LIVES).toBe(3)
  })
})

describe('buildEssenceOptions', () => {
  it('always includes the real, unrotated, unscaled, true-color target among exactly 4 unique options', () => {
    const target = ESSENCE_THEMES[0]
    if (target === undefined) throw new Error('no themes defined')
    for (let i = 0; i < 20; i += 1) {
      const { correctOptionId, options } = buildEssenceOptions(target)
      expect(options.length).toBe(4)
      expect(new Set(options.map((o) => o.optionId)).size).toBe(4)
      const correctOption = options.find((o) => o.optionId === correctOptionId)
      expect(correctOption?.rotationDeg).toBe(0)
      expect(correctOption?.scale).toBe(1)
      expect(correctOption?.color).toBe(target.color)
    }
  })

  it('gives every decoy exactly one of rotation/color/scale changed from the target, never zero, never all three', () => {
    const target = ESSENCE_THEMES[0]
    if (target === undefined) throw new Error('no themes defined')
    const { correctOptionId, options } = buildEssenceOptions(target)
    const decoys = options.filter((o) => o.optionId !== correctOptionId)
    expect(decoys.length).toBe(3)
    for (const decoy of decoys) {
      const changedCount = [decoy.rotationDeg !== 0, decoy.color !== target.color, decoy.scale !== 1].filter(Boolean).length
      expect(changedCount).toBe(1)
    }
  })
})

describe('buildSessionRounds', () => {
  it('produces exactly ROUNDS_PER_SESSION (16) rounds — 2 per category across 8 categories', () => {
    const rounds = buildSessionRounds()
    expect(ROUNDS_PER_SESSION).toBe(16)
    expect(rounds.length).toBe(16)

    const counts = new Map<string, number>()
    for (const round of rounds) {
      counts.set(round.category, (counts.get(round.category) ?? 0) + 1)
    }
    for (const count of counts.values()) {
      expect(count).toBe(2)
    }
  })

  it('never repeats the same target theme twice within one category in a session', () => {
    const rounds = buildSessionRounds()
    const byCategory = new Map<string, string[]>()
    for (const round of rounds) {
      const list = byCategory.get(round.category) ?? []
      list.push(round.target.id)
      byCategory.set(round.category, list)
    }
    for (const targets of byCategory.values()) {
      expect(new Set(targets).size).toBe(targets.length)
    }
  })

  it('every round has exactly 4 unique options including the correct one', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      expect(round.options.length).toBe(4)
      expect(new Set(round.options.map((o) => o.optionId)).size).toBe(4)
      expect(round.options.some((o) => o.optionId === round.correctOptionId)).toBe(true)
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

  it('adds the timing bonus when the reaction is within the tightened fast window', () => {
    expect(computePointsForCorrectMatch(1, 100)).toBe(BASE_POINTS_PER_CORRECT_MATCH + TIMING_BONUS_POINTS)
  })

  it('applies both the streak multiplier and the timing bonus together', () => {
    expect(computePointsForCorrectMatch(2, 100)).toBe(BASE_POINTS_PER_CORRECT_MATCH * 2 + TIMING_BONUS_POINTS)
  })
})
