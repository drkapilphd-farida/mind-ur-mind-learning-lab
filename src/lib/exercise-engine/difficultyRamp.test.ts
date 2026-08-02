import { describe, it, expect } from 'vitest'
import {
  buildRampedSession,
  computeSessionSpeedRamp,
  comboMicroFeedback,
  levelIndexForTier,
  RAMP_LEVEL_TIERS,
} from './difficultyRamp'

describe('buildRampedSession', () => {
  it('splits a 20-item session into exactly the 5 segments of 4 the Number Flash spec expects', () => {
    const segments: number[] = []
    buildRampedSession({
      totalItems: 20,
      levelCount: 5,
      startLevelIndex: 0,
      seed: 1,
      buildSegment: (levelIndex, count) => {
        segments.push(count)
        return Array.from({ length: count }, () => levelIndex)
      },
    })
    expect(segments).toEqual([4, 4, 4, 4, 4])
  })

  it('escalates one level per segment starting from level 0', () => {
    const result = buildRampedSession({
      totalItems: 20,
      levelCount: 5,
      startLevelIndex: 0,
      seed: 1,
      buildSegment: (levelIndex, count) => Array.from({ length: count }, () => levelIndex),
    })
    // Challenge 1-4 -> level 0, 5-8 -> level 1, ..., 17-20 -> level 4
    expect(result.slice(0, 4)).toEqual([0, 0, 0, 0])
    expect(result.slice(4, 8)).toEqual([1, 1, 1, 1])
    expect(result.slice(8, 12)).toEqual([2, 2, 2, 2])
    expect(result.slice(12, 16)).toEqual([3, 3, 3, 3])
    expect(result.slice(16, 20)).toEqual([4, 4, 4, 4])
  })

  it('clamps at the top level rather than exceeding it when starting near the ceiling', () => {
    const result = buildRampedSession({
      totalItems: 20,
      levelCount: 5,
      startLevelIndex: 3, // Expert
      seed: 1,
      buildSegment: (levelIndex, count) => Array.from({ length: count }, () => levelIndex),
    })
    // Expert(3) -> Master(4) -> Master(4) -> Master(4) -> Master(4), never level 5+
    expect(result.slice(0, 4)).toEqual([3, 3, 3, 3])
    expect(result.slice(4, 8)).toEqual([4, 4, 4, 4])
    expect(result.slice(16, 20)).toEqual([4, 4, 4, 4])
    expect(Math.max(...result)).toBe(4)
  })

  it('returns an empty array for zero total items', () => {
    expect(buildRampedSession({ totalItems: 0, levelCount: 5, startLevelIndex: 0, seed: 1, buildSegment: () => [1] })).toEqual([])
  })

  it('is deterministic for a given seed', () => {
    const build = (levelIndex: number, count: number, seed: number): string[] => Array.from({ length: count }, () => `${levelIndex}-${seed}`)
    const first = buildRampedSession({ totalItems: 20, levelCount: 5, startLevelIndex: 0, seed: 42, buildSegment: build })
    const second = buildRampedSession({ totalItems: 20, levelCount: 5, startLevelIndex: 0, seed: 42, buildSegment: build })
    expect(second).toEqual(first)
  })
})

describe('computeSessionSpeedRamp', () => {
  it('steps through real SPEED_TIERS values, one tier faster per segment', () => {
    const ramp = computeSessionSpeedRamp({ startSpeedMs: 500, segmentCount: 5, minSpeedMs: 50 })
    expect(ramp).toEqual([500, 400, 300, 250, 200])
  })

  it('never exceeds the mission minSpeedMs floor regardless of segment count', () => {
    const ramp = computeSessionSpeedRamp({ startSpeedMs: 500, segmentCount: 20, minSpeedMs: 300 })
    for (const speed of ramp) {
      expect(speed).toBeGreaterThanOrEqual(300)
    }
    expect(Math.min(...ramp)).toBe(300)
  })

  it('every value is monotonically non-increasing (never gets slower mid-ramp)', () => {
    const ramp = computeSessionSpeedRamp({ startSpeedMs: 1000, segmentCount: 5, minSpeedMs: 50 })
    for (let i = 1; i < ramp.length; i++) {
      expect(ramp[i]!).toBeLessThanOrEqual(ramp[i - 1]!)
    }
  })
})

describe('comboMicroFeedback', () => {
  it('returns null below a combo of 2 (a single correct answer is not a streak)', () => {
    expect(comboMicroFeedback(0)).toBeNull()
    expect(comboMicroFeedback(1)).toBeNull()
  })

  it('returns elegant, non-arcade phrasing for real streaks', () => {
    expect(comboMicroFeedback(2)).toBe('Perfect')
    expect(comboMicroFeedback(3)).toBe('Combo ×3')
    expect(comboMicroFeedback(5)).toBe('Combo ×5')
    expect(comboMicroFeedback(7)).toBe('Excellent Focus')
    expect(comboMicroFeedback(10)).toBe('Outstanding')
  })
})

describe('levelIndexForTier', () => {
  it('maps every DifficultyTier to a valid index within RAMP_LEVEL_TIERS', () => {
    const tiers = [...RAMP_LEVEL_TIERS, 'easy', 'elite', 'adaptive'] as const
    for (const tier of tiers) {
      const idx = levelIndexForTier(tier)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(RAMP_LEVEL_TIERS.length)
    }
  })

  it('maps the 5 canonical tiers to their own position in order', () => {
    RAMP_LEVEL_TIERS.forEach((tier, expectedIndex) => {
      expect(levelIndexForTier(tier)).toBe(expectedIndex)
    })
  })
})
