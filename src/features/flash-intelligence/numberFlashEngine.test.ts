import { describe, it, expect } from 'vitest'
import type { ContentItem } from '@/types/exercise-engine'
import {
  buildNumberFlashItems,
  computeRecognitionRatePerMinute,
  computeEstimatedVisualProcessingGrowth,
} from './numberFlashEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { NUMBER_FLASH_DATASET } from './numberFlashDataset'
import { DIFFICULTY_TIERS } from '@/lib/exercise-engine/difficultyEngine'

function num(id: string, content: string): ContentItem {
  return { id, content, contentLabel: content, difficulty: 'medium', locale: 'en' }
}

describe('buildNumberFlashItems', () => {
  const numbers: ContentItem[] = [
    num('n1', '48291'), num('n2', '77213'), num('n3', '90456'),
    num('n4', '10238'), num('n5', '65432'), num('n6', '99001'),
  ]

  it('returns an empty array for an empty number pool', () => {
    expect(buildNumberFlashItems([], 10, 1)).toEqual([])
  })

  it('produces well-formed SessionItems: 4 unique options, correctIndex points at the stimulus', () => {
    const items = buildNumberFlashItems(numbers, 5, 42)
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.options).toHaveLength(4)
      expect(new Set(item.options).size).toBe(4)
      expect(item.correctIndex).toBeGreaterThanOrEqual(0)
      expect(item.correctIndex).toBeLessThan(4)
      expect(item.options[item.correctIndex]).toBe(item.stimulus)
      expect(item.renderAs).toBe('number')
    }
  })

  it('generates distractors by perturbing the stimulus — same length, mostly-shared digits, never the correct number itself', () => {
    const items = buildNumberFlashItems(numbers, 5, 7)
    for (const item of items) {
      const distractors = item.options.filter((o) => o !== item.stimulus)
      expect(distractors).toHaveLength(3)
      for (const distractor of distractors) {
        expect(distractor).not.toBe(item.stimulus)
        expect(distractor.length).toBe(item.stimulus.length)
        // "Genuinely confusable" — differs from the stimulus in only a
        // small number of digit positions, not a completely different
        // number. A pure random same-length number would typically differ
        // in most positions; a perturbation differs in at most 2.
        let differingPositions = 0
        for (let i = 0; i < item.stimulus.length; i++) {
          if (distractor[i] !== item.stimulus[i]) differingPositions++
        }
        expect(differingPositions).toBeLessThanOrEqual(2)
      }
    }
  })

  it('never produces a distractor with a leading zero', () => {
    const items = buildNumberFlashItems(numbers, 5, 3)
    for (const item of items) {
      for (const option of item.options) {
        expect(option[0]).not.toBe('0')
      }
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildNumberFlashItems(numbers, 5, 99)
    const second = buildNumberFlashItems(numbers, 5, 99)
    expect(second).toEqual(first)
  })

  it('produces IDs unique within a session', () => {
    const items = buildNumberFlashItems(numbers, 5, 5)
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('handles 2-digit numbers (the smallest tier) without collapsing to duplicate options', () => {
    const twoDigit: ContentItem[] = [
      num('a', '31'), num('b', '48'), num('c', '77'), num('d', '55'), num('e', '22'),
    ]
    const items = buildNumberFlashItems(twoDigit, 5, 11)
    for (const item of items) {
      expect(new Set(item.options).size).toBe(4)
    }
  })
})

describe('generated number dataset', () => {
  it('every item is visually valid at the strictest (option) role', () => {
    for (const item of NUMBER_FLASH_DATASET.items) {
      expect(isVisuallyValid(item.content, 'option')).toBe(true)
    }
  })

  it('never has a leading zero', () => {
    for (const item of NUMBER_FLASH_DATASET.items) {
      expect(item.content[0]).not.toBe('0')
    }
  })

  it('every item is purely numeric digits', () => {
    for (const item of NUMBER_FLASH_DATASET.items) {
      expect(/^\d+$/.test(item.content)).toBe(true)
    }
  })

  it('has enough content at every one of the 8 DifficultyTier levels', () => {
    for (const tier of DIFFICULTY_TIERS) {
      const atTier = NUMBER_FLASH_DATASET.items.filter((i) => i.difficulty === tier)
      expect(atTier.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('digit length scales with tier: beginner is shortest, master is longest', () => {
    const beginnerLength = NUMBER_FLASH_DATASET.items.find((i) => i.difficulty === 'beginner')!.content.length
    const masterLength = NUMBER_FLASH_DATASET.items.find((i) => i.difficulty === 'master')!.content.length
    expect(masterLength).toBeGreaterThan(beginnerLength)
  })
})

describe('computeRecognitionRatePerMinute', () => {
  it('converts average reaction time to a numbers-per-minute rate', () => {
    expect(computeRecognitionRatePerMinute(1000)).toBe(60)
    expect(computeRecognitionRatePerMinute(500)).toBe(120)
  })

  it('returns 0 for zero or negative reaction time', () => {
    expect(computeRecognitionRatePerMinute(0)).toBe(0)
    expect(computeRecognitionRatePerMinute(-50)).toBe(0)
  })
})

describe('computeEstimatedVisualProcessingGrowth', () => {
  it('returns null when there is no previous session', () => {
    expect(computeEstimatedVisualProcessingGrowth(80, null)).toBeNull()
  })

  it('returns the signed difference from the previous session', () => {
    expect(computeEstimatedVisualProcessingGrowth(90, 80)).toBe(10)
    expect(computeEstimatedVisualProcessingGrowth(70, 80)).toBe(-10)
  })
})
