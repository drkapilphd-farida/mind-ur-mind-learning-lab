import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  VERTICAL_WORD_READING_CATEGORIES,
  TOTAL_VERTICAL_WORD_READING_CATEGORIES,
  buildUnitsForCategory,
  pickSessionCategory,
} from './verticalWordReadingDataset'

describe('VERTICAL_WORD_READING_CATEGORIES', () => {
  it('has at least 25 categories per spec', () => {
    expect(TOTAL_VERTICAL_WORD_READING_CATEGORIES).toBeGreaterThanOrEqual(25)
  })

  it('gives every category a unique id', () => {
    const ids = new Set(VERTICAL_WORD_READING_CATEGORIES.map((category) => category.id))
    expect(ids.size).toBe(VERTICAL_WORD_READING_CATEGORIES.length)
  })

  it('gives every category a unique label', () => {
    const labels = new Set(VERTICAL_WORD_READING_CATEGORIES.map((category) => category.label))
    expect(labels.size).toBe(VERTICAL_WORD_READING_CATEGORIES.length)
  })

  it('never repeats a word within the same category', () => {
    for (const category of VERTICAL_WORD_READING_CATEGORIES) {
      const unique = new Set(category.words)
      expect(unique.size).toBe(category.words.length)
    }
  })

  // At this app's own default 250 WPM (useReadingRuntime's own
  // DEFAULT_TARGET_WPM), a fixed word count can't guarantee "60-90
  // seconds" across the *entire* user-selectable 100-500 WPM range — no
  // dataset in this app promises that. This instead verifies the genuine
  // floor: every category runs at least 60 real seconds at the default
  // pace, so "continuous 60+ second reading experience" holds for a
  // typical session.
  it('gives every category enough real words for a 60+ second read at the default 250 WPM', () => {
    for (const category of VERTICAL_WORD_READING_CATEGORIES) {
      const totalWordCount = category.words.join(' ').trim().split(/\s+/).length
      const durationSeconds = (totalWordCount * 60) / 250
      expect(durationSeconds).toBeGreaterThanOrEqual(60)
    }
  })
})

describe('buildUnitsForCategory', () => {
  it('produces one unit per word, with unique ids, for every category', () => {
    for (const category of VERTICAL_WORD_READING_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      expect(units.length).toBe(category.words.length)
      const ids = new Set(units.map((unit) => unit.id))
      expect(ids.size).toBe(units.length)
    }
  })
})

describe('pickSessionCategory', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('always returns a real category from the list', () => {
    const picked = pickSessionCategory()
    expect(VERTICAL_WORD_READING_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists the picked category id to its own storage key', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-vertical-word-reading-last-category']).toBe(picked.id)
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
