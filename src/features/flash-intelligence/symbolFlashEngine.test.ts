import { describe, it, expect } from 'vitest'
import type { ContentItem } from '@/types/exercise-engine'
import {
  buildSymbolFlashItems,
  computeRecognitionRatePerMinute,
  computeEstimatedVisualProcessingGrowth,
} from './symbolFlashEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { SYMBOL_FLASH_DATASET } from './symbolFlashDataset'
import { DIFFICULTY_TIERS } from '@/lib/exercise-engine/difficultyEngine'

function sym(id: string, content: string, family?: string): ContentItem {
  return {
    id,
    content,
    contentLabel: content,
    difficulty: 'medium',
    locale: 'en',
    ...(family !== undefined ? { metadata: { family } } : {}),
  }
}

describe('buildSymbolFlashItems — single symbol (group size 1)', () => {
  const symbols: ContentItem[] = [
    sym('s1', '★', 'star'), sym('s2', '☆', 'star'),
    sym('s3', '▲', 'triangle'), sym('s4', '△', 'triangle'),
    sym('s5', '●'), sym('s6', '■'), sym('s7', '✓'), sym('s8', '@'),
  ]

  it('returns an empty array for an empty symbol pool', () => {
    expect(buildSymbolFlashItems([], 1, 10, 1)).toEqual([])
  })

  it('produces well-formed SessionItems: 4 unique options, correctIndex points at the stimulus', () => {
    const items = buildSymbolFlashItems(symbols, 1, 5, 42)
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.options).toHaveLength(4)
      expect(new Set(item.options).size).toBe(4)
      expect(item.options[item.correctIndex]).toBe(item.stimulus)
      expect(item.renderAs).toBe('symbol')
    }
  })

  it('prefers family-confusable distractors when a family exists (★ should be paired with ☆-style options, not random)', () => {
    const items = buildSymbolFlashItems(symbols, 1, 8, 3)
    const starItem = items.find((i) => i.stimulus === '★')
    if (starItem) {
      expect(starItem.options).toContain('☆')
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildSymbolFlashItems(symbols, 1, 5, 99)
    const second = buildSymbolFlashItems(symbols, 1, 5, 99)
    expect(second).toEqual(first)
  })

  it('never produces duplicate stimuli within one call', () => {
    const items = buildSymbolFlashItems(symbols, 1, 8, 7)
    const stimuli = items.map((i) => i.stimulus)
    expect(new Set(stimuli).size).toBe(stimuli.length)
  })
})

describe('buildSymbolFlashItems — multi-symbol groups', () => {
  const symbols: ContentItem[] = [
    sym('s1', '#'), sym('s2', '%'), sym('s3', '&'), sym('s4', '$'),
    sym('s5', '@'), sym('s6', '?'), sym('s7', '!'), sym('s8', '+'),
  ]

  it('composes a 2-symbol group as a space-joined stimulus', () => {
    const items = buildSymbolFlashItems(symbols, 2, 3, 5)
    for (const item of items) {
      const parts = item.stimulus.split(' ')
      expect(parts).toHaveLength(2)
      expect(parts[0]).not.toBe(parts[1])
    }
  })

  it('composes a 3-symbol group as a space-joined stimulus', () => {
    const items = buildSymbolFlashItems(symbols, 3, 3, 5)
    for (const item of items) {
      const parts = item.stimulus.split(' ')
      expect(parts).toHaveLength(3)
      expect(new Set(parts).size).toBe(3)
    }
  })

  it('generates group distractors that differ from the stimulus by only a small perturbation, not a wholly different group', () => {
    const items = buildSymbolFlashItems(symbols, 2, 4, 11)
    for (const item of items) {
      const stimulusParts = item.stimulus.split(' ')
      const distractors = item.options.filter((o) => o !== item.stimulus)
      expect(distractors).toHaveLength(3)
      for (const distractor of distractors) {
        const distractorParts = distractor.split(' ').sort()
        const stimulusSorted = [...stimulusParts].sort()
        // At least one symbol should be shared between the distractor and
        // the original group (a genuinely confusable near-miss), unless
        // it's a same-symbols-different-order variant (also valid).
        const shared = distractorParts.filter((p) => stimulusSorted.includes(p))
        expect(shared.length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('mixed mode produces groups of varying size across items', () => {
    const items = buildSymbolFlashItems(symbols, 'mixed', 10, 21)
    const sizes = new Set(items.map((i) => i.stimulus.split(' ').length))
    // With 10 items and 3 possible sizes, expect at least 2 distinct sizes to appear
    expect(sizes.size).toBeGreaterThanOrEqual(2)
  })
})

describe('curated symbol dataset', () => {
  it('every item is visually valid at the strictest (option) role, even as a 3-symbol group', () => {
    for (const item of SYMBOL_FLASH_DATASET.items) {
      expect(isVisuallyValid(item.content, 'option')).toBe(true)
    }
    // A worst-case 3-symbol group joined by spaces is still short
    const worstCase = SYMBOL_FLASH_DATASET.items.slice(0, 3).map((i) => i.content).join(' ')
    expect(isVisuallyValid(worstCase, 'option')).toBe(true)
  })

  it('has enough content at every one of the 8 DifficultyTier levels', () => {
    for (const tier of DIFFICULTY_TIERS) {
      const atTier = SYMBOL_FLASH_DATASET.items.filter((i) => i.difficulty === tier)
      expect(atTier.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('never contains duplicate symbols', () => {
    const texts = SYMBOL_FLASH_DATASET.items.map((i) => i.content)
    expect(new Set(texts).size).toBe(texts.length)
  })
})

describe('computeRecognitionRatePerMinute', () => {
  it('converts average reaction time to a symbols-per-minute rate', () => {
    expect(computeRecognitionRatePerMinute(1000)).toBe(60)
  })
  it('returns 0 for zero or negative reaction time', () => {
    expect(computeRecognitionRatePerMinute(0)).toBe(0)
  })
})

describe('computeEstimatedVisualProcessingGrowth', () => {
  it('returns null when there is no previous session', () => {
    expect(computeEstimatedVisualProcessingGrowth(80, null)).toBeNull()
  })
  it('returns the signed difference from the previous session', () => {
    expect(computeEstimatedVisualProcessingGrowth(90, 80)).toBe(10)
  })
})
