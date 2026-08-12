import { describe, expect, it } from 'vitest'
import {
  DOT_MEMORY_GRID_SIZES,
  DOT_MEMORY_GRID_ROUNDS_PER_SESSION,
  totalCellsForGridSize,
  dotCountForRound,
  pickTargetCellIndices,
  computeAccuracyPercent,
} from './dotMemoryGridEngine'

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
    expect(totalCellsForGridSize(6)).toBe(36)
  })
})

describe('dotCountForRound', () => {
  it('escalates from 3 to 7 across the 5 rounds on every offered grid size', () => {
    for (const gridSize of DOT_MEMORY_GRID_SIZES) {
      const counts = Array.from({ length: DOT_MEMORY_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => dotCountForRound(roundIndex, gridSize))
      expect(counts).toEqual([3, 4, 5, 6, 7])
    }
  })

  it('never exceeds half the grid total, even for a hypothetical tiny grid', () => {
    // @ts-expect-error deliberately probing a smaller-than-offered size to prove the safety cap works
    expect(dotCountForRound(4, 2)).toBeLessThanOrEqual(2)
  })
})

describe('pickTargetCellIndices', () => {
  it('returns exactly `count` distinct, in-range, ascending indices', () => {
    const picked = pickTargetCellIndices(36, 7, createSeededRandom(1))
    expect(picked).toHaveLength(7)
    expect(new Set(picked).size).toBe(7)
    for (const index of picked) {
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(36)
    }
    expect(picked).toEqual([...picked].sort((a, b) => a - b))
  })

  it('clamps count to totalCells when count exceeds it', () => {
    const picked = pickTargetCellIndices(4, 10, createSeededRandom(2))
    expect(picked).toEqual([0, 1, 2, 3])
  })

  it('produces different picks across different seeds (genuinely random, not fixed)', () => {
    const first = pickTargetCellIndices(36, 7, createSeededRandom(3))
    const second = pickTargetCellIndices(36, 7, createSeededRandom(4))
    expect(first).not.toEqual(second)
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
