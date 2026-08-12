import { describe, expect, it } from 'vitest'
import {
  NUMBER_FLASH_GRID_SIZES,
  NUMBER_FLASH_GRID_ROUNDS_PER_SESSION,
  totalCellsForGridSize,
  digitCountForRound,
  flashDurationMsForRound,
  pickTargetCells,
  computeAccuracyPercent,
} from './numberFlashGridEngine'

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('totalCellsForGridSize', () => {
  it('returns size squared for every offered grid size', () => {
    expect(totalCellsForGridSize(4)).toBe(16)
    expect(totalCellsForGridSize(5)).toBe(25)
  })
})

describe('digitCountForRound', () => {
  it('escalates from 3 to 6 across the 5 rounds, holding at the ceiling, on every offered grid size', () => {
    for (const gridSize of NUMBER_FLASH_GRID_SIZES) {
      const counts = Array.from({ length: NUMBER_FLASH_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => digitCountForRound(roundIndex, gridSize))
      expect(counts).toEqual([3, 4, 5, 6, 6])
    }
  })

  it('never exceeds half the grid total, even for a hypothetical tiny grid', () => {
    // @ts-expect-error deliberately probing a smaller-than-offered size to prove the safety cap works
    expect(digitCountForRound(4, 2)).toBeLessThanOrEqual(2)
  })
})

describe('flashDurationMsForRound', () => {
  it('shrinks every round, including after the digit-count escalation has already capped', () => {
    const durations = Array.from({ length: NUMBER_FLASH_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => flashDurationMsForRound(roundIndex))
    expect(durations).toEqual([1000, 850, 700, 600, 500])
    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeLessThan(durations[i - 1]!)
    }
  })
})

describe('pickTargetCells', () => {
  it('returns exactly `count` distinct, in-range cells, each with a 0-9 digit', () => {
    const picked = pickTargetCells(25, 6, createSeededRandom(1))
    expect(picked).toHaveLength(6)
    expect(new Set(picked.map((cell) => cell.cellIndex)).size).toBe(6)
    for (const { cellIndex, digit } of picked) {
      expect(cellIndex).toBeGreaterThanOrEqual(0)
      expect(cellIndex).toBeLessThan(25)
      expect(Number.isInteger(digit)).toBe(true)
      expect(digit).toBeGreaterThanOrEqual(0)
      expect(digit).toBeLessThanOrEqual(9)
    }
  })

  it('clamps count to totalCells when count exceeds it', () => {
    const picked = pickTargetCells(4, 10, createSeededRandom(2))
    expect(picked.map((cell) => cell.cellIndex)).toEqual([0, 1, 2, 3])
  })

  it('produces different picks across different seeds (genuinely random, not fixed)', () => {
    const first = pickTargetCells(25, 6, createSeededRandom(3))
    const second = pickTargetCells(25, 6, createSeededRandom(4))
    expect(first).not.toEqual(second)
  })

  it('allows repeated digits across cells within the same round', () => {
    // A large pool of cells with a fixed randomFn that always returns the
    // same value would assign the same digit to every cell — proving
    // digit repetition is genuinely allowed, not silently deduped.
    const picked = pickTargetCells(25, 5, () => 0.5)
    const digits = picked.map((cell) => cell.digit)
    expect(new Set(digits).size).toBe(1)
  })
})

describe('computeAccuracyPercent', () => {
  it('computes a rounded percentage', () => {
    expect(computeAccuracyPercent(4, 5)).toBe(80)
    expect(computeAccuracyPercent(1, 3)).toBe(33)
    expect(computeAccuracyPercent(25, 25)).toBe(100)
  })

  it('returns 0 for a zero or negative total rather than dividing by zero', () => {
    expect(computeAccuracyPercent(0, 0)).toBe(0)
    expect(computeAccuracyPercent(5, -1)).toBe(0)
  })
})
