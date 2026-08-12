import { describe, expect, it } from 'vitest'
import {
  WORD_FLASH_GRID_SIZES,
  WORD_FLASH_GRID_ROUNDS_PER_SESSION,
  WORD_FLASH_BANK,
  totalCellsForGridSize,
  wordCountForRound,
  flashDurationMsForRound,
  pickTargetWords,
  buildWordPickerOptions,
  computeAccuracyPercent,
} from './wordFlashGridEngine'

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

describe('WORD_FLASH_BANK', () => {
  it('has enough distinct words for the hardest round plus decoys', () => {
    expect(new Set(WORD_FLASH_BANK).size).toBe(WORD_FLASH_BANK.length)
    expect(WORD_FLASH_BANK.length).toBeGreaterThanOrEqual(10)
  })

  it('every word is real uppercase text, not lorem or placeholder', () => {
    for (const word of WORD_FLASH_BANK) {
      expect(word).toMatch(/^[A-Z]+$/)
      expect(word.length).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('wordCountForRound', () => {
  it('escalates from 3 to 6 across the 5 rounds, holding at the ceiling, on every offered grid size', () => {
    for (const gridSize of WORD_FLASH_GRID_SIZES) {
      const counts = Array.from({ length: WORD_FLASH_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => wordCountForRound(roundIndex, gridSize))
      expect(counts).toEqual([3, 4, 5, 6, 6])
    }
  })

  it('never exceeds half the grid total, even for a hypothetical tiny grid', () => {
    // @ts-expect-error deliberately probing a smaller-than-offered size to prove the safety cap works
    expect(wordCountForRound(4, 2)).toBeLessThanOrEqual(2)
  })
})

describe('flashDurationMsForRound', () => {
  it('shrinks every round, including after the word-count escalation has already capped', () => {
    const durations = Array.from({ length: WORD_FLASH_GRID_ROUNDS_PER_SESSION }, (_, roundIndex) => flashDurationMsForRound(roundIndex))
    expect(durations).toEqual([1000, 850, 700, 600, 500])
    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeLessThan(durations[i - 1]!)
    }
  })
})

describe('pickTargetWords', () => {
  it('returns exactly `count` distinct, in-range cells, each with a real bank word', () => {
    const picked = pickTargetWords(25, 6, createSeededRandom(1))
    expect(picked).toHaveLength(6)
    expect(new Set(picked.map((cell) => cell.cellIndex)).size).toBe(6)
    for (const { cellIndex, word } of picked) {
      expect(cellIndex).toBeGreaterThanOrEqual(0)
      expect(cellIndex).toBeLessThan(25)
      expect(WORD_FLASH_BANK).toContain(word)
    }
  })

  it('never repeats the same word twice within a single round', () => {
    const picked = pickTargetWords(25, 6, createSeededRandom(5))
    expect(new Set(picked.map((cell) => cell.word)).size).toBe(6)
  })

  it('clamps count to totalCells when count exceeds it', () => {
    const picked = pickTargetWords(4, 10, createSeededRandom(2))
    expect(picked.map((cell) => cell.cellIndex)).toEqual([0, 1, 2, 3])
  })

  it('produces different picks across different seeds (genuinely random, not fixed)', () => {
    const first = pickTargetWords(25, 6, createSeededRandom(3))
    const second = pickTargetWords(25, 6, createSeededRandom(4))
    expect(first).not.toEqual(second)
  })
})

describe('buildWordPickerOptions', () => {
  it('includes every target word plus decoys, all distinct', () => {
    const targetWords = ['FOCUS', 'CALM', 'FLOW']
    const options = buildWordPickerOptions(targetWords, createSeededRandom(6))
    for (const word of targetWords) {
      expect(options).toContain(word)
    }
    expect(new Set(options).size).toBe(options.length)
    expect(options.length).toBe(targetWords.length + 4)
  })

  it('decoys are never one of the real target words', () => {
    const targetWords = ['FOCUS', 'CALM', 'FLOW']
    const options = buildWordPickerOptions(targetWords, createSeededRandom(7))
    const decoys = options.filter((word) => !targetWords.includes(word))
    for (const decoy of decoys) {
      expect(WORD_FLASH_BANK).toContain(decoy)
      expect(targetWords).not.toContain(decoy)
    }
  })

  it('caps decoy count at the remaining bank size rather than erroring', () => {
    const almostWholeBank = WORD_FLASH_BANK.slice(0, WORD_FLASH_BANK.length - 2)
    const options = buildWordPickerOptions(almostWholeBank, createSeededRandom(8))
    expect(options.length).toBe(WORD_FLASH_BANK.length)
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
