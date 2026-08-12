import { describe, expect, it } from 'vitest'
import {
  IMAGE_FLASH_GRID_SIZES,
  IMAGE_FLASH_GRID_ROUNDS_PER_SESSION,
  ICON_FLASH_BANK,
  totalCellsForGridSize,
  iconCountForRound,
  flashDurationMsForRound,
  pickTargetIcons,
  buildIconPickerOptions,
  computeAccuracyPercent,
} from './imageFlashGridEngine'

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

describe('ICON_FLASH_BANK', () => {
  it('has enough distinct icons for the hardest round plus decoys', () => {
    expect(new Set(ICON_FLASH_BANK).size).toBe(ICON_FLASH_BANK.length)
    expect(ICON_FLASH_BANK.length).toBeGreaterThanOrEqual(10)
  })

  it('every entry is a real, non-empty glyph, not lorem or placeholder text', () => {
    for (const icon of ICON_FLASH_BANK) {
      expect(icon.length).toBeGreaterThan(0)
      expect(icon).not.toMatch(/^[A-Za-z0-9\s]+$/)
    }
  })
})

describe('iconCountForRound', () => {
  it('escalates from 3 to 6 across the 5 rounds, holding at the ceiling, on every offered grid size', () => {
    for (const gridSize of IMAGE_FLASH_GRID_SIZES) {
      const counts = Array.from({ length: IMAGE_FLASH_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => iconCountForRound(roundIndex, gridSize))
      expect(counts).toEqual([3, 4, 5, 6, 6])
    }
  })

  it('never exceeds half the grid total, even for a hypothetical tiny grid', () => {
    // @ts-expect-error deliberately probing a smaller-than-offered size to prove the safety cap works
    expect(iconCountForRound(4, 2)).toBeLessThanOrEqual(2)
  })
})

describe('flashDurationMsForRound', () => {
  it('shrinks every round, including after the icon-count escalation has already capped', () => {
    const durations = Array.from({ length: IMAGE_FLASH_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => flashDurationMsForRound(roundIndex))
    expect(durations).toEqual([1000, 850, 700, 600, 500])
    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeLessThan(durations[i - 1]!)
    }
  })
})

describe('pickTargetIcons', () => {
  it('returns exactly `count` distinct, in-range cells, each with a real bank icon', () => {
    const picked = pickTargetIcons(25, 6, createSeededRandom(1))
    expect(picked).toHaveLength(6)
    expect(new Set(picked.map((cell) => cell.cellIndex)).size).toBe(6)
    for (const { cellIndex, icon } of picked) {
      expect(cellIndex).toBeGreaterThanOrEqual(0)
      expect(cellIndex).toBeLessThan(25)
      expect(ICON_FLASH_BANK).toContain(icon)
    }
  })

  it('never repeats the same icon twice within a single round', () => {
    const picked = pickTargetIcons(25, 6, createSeededRandom(5))
    expect(new Set(picked.map((cell) => cell.icon)).size).toBe(6)
  })

  it('clamps count to totalCells when count exceeds it', () => {
    const picked = pickTargetIcons(4, 10, createSeededRandom(2))
    expect(picked.map((cell) => cell.cellIndex)).toEqual([0, 1, 2, 3])
  })

  it('produces different picks across different seeds (genuinely random, not fixed)', () => {
    const first = pickTargetIcons(25, 6, createSeededRandom(3))
    const second = pickTargetIcons(25, 6, createSeededRandom(4))
    expect(first).not.toEqual(second)
  })
})

describe('buildIconPickerOptions', () => {
  it('includes every target icon plus decoys, all distinct', () => {
    const targetIcons = ['⭐', '💎', '⚡']
    const options = buildIconPickerOptions(targetIcons, createSeededRandom(6))
    for (const icon of targetIcons) {
      expect(options).toContain(icon)
    }
    expect(new Set(options).size).toBe(options.length)
    expect(options.length).toBe(targetIcons.length + 4)
  })

  it('decoys are never one of the real target icons', () => {
    const targetIcons = ['⭐', '💎', '⚡']
    const options = buildIconPickerOptions(targetIcons, createSeededRandom(7))
    const decoys = options.filter((icon) => !targetIcons.includes(icon))
    for (const decoy of decoys) {
      expect(ICON_FLASH_BANK).toContain(decoy)
      expect(targetIcons).not.toContain(decoy)
    }
  })

  it('caps decoy count at the remaining bank size rather than erroring', () => {
    const almostWholeBank = ICON_FLASH_BANK.slice(0, ICON_FLASH_BANK.length - 2)
    const options = buildIconPickerOptions(almostWholeBank, createSeededRandom(8))
    expect(options.length).toBe(ICON_FLASH_BANK.length)
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
