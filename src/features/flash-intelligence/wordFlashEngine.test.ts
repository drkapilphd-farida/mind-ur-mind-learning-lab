import { describe, it, expect } from 'vitest'
import type { ContentItem } from '@/types/exercise-engine'
import {
  buildWordFlashItems,
  computeRecognitionSpeedWpm,
  computeEstimatedSessionWpm,
  computeEstimatedWpmGrowth,
  computeFlashXp,
} from './wordFlashEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { WORD_FLASH_DATASET } from './wordFlashDataset'
import { DIFFICULTY_TIERS } from '@/lib/exercise-engine/difficultyEngine'

function word(id: string, content: string): ContentItem {
  return { id, content, contentLabel: content, difficulty: 'medium', locale: 'en' }
}

describe('buildWordFlashItems', () => {
  const words: ContentItem[] = [
    word('w1', 'calm'), word('w2', 'book'), word('w3', 'page'),
    word('w4', 'view'), word('w5', 'scan'), word('w6', 'word'),
  ]

  it('returns an empty array for an empty word pool', () => {
    expect(buildWordFlashItems([], 10, 1)).toEqual([])
  })

  it('produces well-formed SessionItems: 4 unique options, correctIndex points at the stimulus', () => {
    const items = buildWordFlashItems(words, 5, 42)
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.options).toHaveLength(4)
      expect(new Set(item.options).size).toBe(4)
      expect(item.correctIndex).toBeGreaterThanOrEqual(0)
      expect(item.correctIndex).toBeLessThan(4)
      expect(item.options[item.correctIndex]).toBe(item.stimulus)
    }
  })

  it('never invents a fallback distractor — every option is a real word from the pool', () => {
    const wordTexts = new Set(words.map((w) => w.content))
    const items = buildWordFlashItems(words, 5, 7)
    for (const item of items) {
      for (const option of item.options) {
        expect(wordTexts.has(option)).toBe(true)
      }
    }
  })

  it('skips a stimulus rather than fabricate a distractor when the pool is too small', () => {
    const tooFew: ContentItem[] = [word('w1', 'calm'), word('w2', 'book')]
    expect(buildWordFlashItems(tooFew, 5, 1)).toEqual([])
  })

  it('de-duplicates case-insensitively so the same word never appears twice as a stimulus', () => {
    const dupePool: ContentItem[] = [
      ...words,
      word('w7', 'Calm'), // same word, different case
    ]
    const items = buildWordFlashItems(dupePool, 10, 3)
    const stimuli = items.map((i) => i.stimulus.toLowerCase())
    expect(new Set(stimuli).size).toBe(stimuli.length)
  })

  it('Visual Width Validator guarantee: every stimulus and every option is visually valid', () => {
    const items = buildWordFlashItems(words, 5, 9)
    for (const item of items) {
      expect(isVisuallyValid(item.stimulus, 'option')).toBe(true)
      for (const option of item.options) {
        expect(isVisuallyValid(option, 'option')).toBe(true)
      }
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildWordFlashItems(words, 5, 99)
    const second = buildWordFlashItems(words, 5, 99)
    expect(second).toEqual(first)
  })

  it('produces IDs unique within a session', () => {
    const items = buildWordFlashItems(words, 5, 5)
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('prefers same-family words as distractors when a family exists in the pool', () => {
    function familyWord(id: string, content: string, family: string): ContentItem {
      return { id, content, contentLabel: content, difficulty: 'advanced', locale: 'en', metadata: { family } }
    }
    const familyPool: ContentItem[] = [
      familyWord('f1', 'receive', 'receive'),
      familyWord('f2', 'receives', 'receive'),
      familyWord('f3', 'received', 'receive'),
      familyWord('f4', 'receiver', 'receive'),
      familyWord('f5', 'recipe', 'receive'),
      // Unrelated filler words that should be passed over in favor of the family
      word('u1', 'unrelated1'), word('u2', 'unrelated2'), word('u3', 'unrelated3'),
    ]
    const items = buildWordFlashItems(familyPool, 1, 11)
    expect(items).toHaveLength(1)
    const item = items[0]!
    const familyTexts = new Set(['receive', 'receives', 'received', 'receiver', 'recipe'])
    const distractorOptions = item.options.filter((o) => o !== item.stimulus)
    // All 3 distractors should come from the family pool, not the filler words
    for (const option of distractorOptions) {
      expect(familyTexts.has(option)).toBe(true)
    }
  })

  it('falls back to non-family candidates when the family pool is too small to fill all 3 slots', () => {
    function familyWord(id: string, content: string, family: string): ContentItem {
      return { id, content, contentLabel: content, difficulty: 'advanced', locale: 'en', metadata: { family } }
    }
    const smallFamilyPool: ContentItem[] = [
      familyWord('f1', 'receive', 'receive'),
      familyWord('f2', 'receiver', 'receive'), // only 1 family sibling available
      word('u1', 'building'), word('u2', 'evidence'), word('u3', 'daylight'),
    ]
    const items = buildWordFlashItems(smallFamilyPool, 1, 3)
    expect(items).toHaveLength(1)
    expect(items[0]!.options).toHaveLength(4)
  })
})

describe('curated word dataset', () => {
  it('every item is a real word, visually valid at the strictest (option) role', () => {
    // Regression guard: every word must be usable both as a flash stimulus
    // and as a ChoiceGrid answer option — the option role is the tightest
    // constraint, so validating against it here covers both usages.
    for (const item of WORD_FLASH_DATASET.items) {
      expect(isVisuallyValid(item.content, 'option')).toBe(true)
      expect(item.content.trim().length).toBeGreaterThan(0)
    }
  })

  it('has enough content at every one of the 8 DifficultyTier levels', () => {
    for (const tier of DIFFICULTY_TIERS) {
      const atTier = WORD_FLASH_DATASET.items.filter((i) => i.difficulty === tier)
      // Need at least 4 distinct words at a tier to build even one item
      // (1 stimulus + 3 distractors) without falling back to neighboring
      // tiers for every single item.
      expect(atTier.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('never contains duplicate words', () => {
    const texts = WORD_FLASH_DATASET.items.map((i) => i.content.toLowerCase())
    expect(new Set(texts).size).toBe(texts.length)
  })
})

describe('computeRecognitionSpeedWpm', () => {
  it('converts average reaction time to a words-per-minute-equivalent rate', () => {
    expect(computeRecognitionSpeedWpm(1000)).toBe(60)
    expect(computeRecognitionSpeedWpm(500)).toBe(120)
  })

  it('returns 0 for zero or negative reaction time rather than dividing by zero', () => {
    expect(computeRecognitionSpeedWpm(0)).toBe(0)
    expect(computeRecognitionSpeedWpm(-100)).toBe(0)
  })
})

describe('computeEstimatedSessionWpm', () => {
  it('discounts recognition speed by accuracy', () => {
    expect(computeEstimatedSessionWpm(100, 1000)).toBe(60)
    expect(computeEstimatedSessionWpm(50, 1000)).toBe(30)
  })

  it('clamps accuracy to the 0–100 range', () => {
    expect(computeEstimatedSessionWpm(150, 1000)).toBe(60)
    expect(computeEstimatedSessionWpm(-10, 1000)).toBe(0)
  })
})

describe('computeEstimatedWpmGrowth', () => {
  it('returns null when there is no previous session to compare against', () => {
    expect(computeEstimatedWpmGrowth(80, null)).toBeNull()
  })

  it('returns the signed difference from the previous session', () => {
    expect(computeEstimatedWpmGrowth(90, 80)).toBe(10)
    expect(computeEstimatedWpmGrowth(70, 80)).toBe(-10)
    expect(computeEstimatedWpmGrowth(80, 80)).toBe(0)
  })
})

describe('computeFlashXp', () => {
  it('scales performanceScore by how many items were actually played relative to a full 20-item session', () => {
    expect(computeFlashXp(80, 20)).toBe(80)
    expect(computeFlashXp(80, 10)).toBe(40)
  })

  it('returns a deterministic, non-negative integer', () => {
    const xp = computeFlashXp(73, 17)
    expect(Number.isInteger(xp)).toBe(true)
    expect(xp).toBeGreaterThanOrEqual(0)
  })
})
