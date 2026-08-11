import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PHRASE_READING_MODE_CATEGORIES,
  TOTAL_PHRASE_READING_MODE_CATEGORIES,
  buildUnitsForCategory,
  pickSessionCategory,
} from './phraseReadingModeDataset'

describe('PHRASE_READING_MODE_CATEGORIES', () => {
  it('has at least 20 categories per spec', () => {
    expect(TOTAL_PHRASE_READING_MODE_CATEGORIES).toBeGreaterThanOrEqual(20)
  })

  it('gives every category a unique id', () => {
    const ids = new Set(PHRASE_READING_MODE_CATEGORIES.map((category) => category.id))
    expect(ids.size).toBe(PHRASE_READING_MODE_CATEGORIES.length)
  })

  it('gives every category a unique label', () => {
    const labels = new Set(PHRASE_READING_MODE_CATEGORIES.map((category) => category.label))
    expect(labels.size).toBe(PHRASE_READING_MODE_CATEGORIES.length)
  })

  it('gives every category multiple sentences (a genuine multi-sentence passage)', () => {
    for (const category of PHRASE_READING_MODE_CATEGORIES) {
      expect(category.sentences.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('splits every sentence into natural 2-4 word phrase chunks', () => {
    for (const category of PHRASE_READING_MODE_CATEGORIES) {
      for (const sentence of category.sentences) {
        expect(sentence.length).toBeGreaterThan(1)
        for (const chunk of sentence) {
          const wordCount = chunk.trim().split(/\s+/).filter(Boolean).length
          expect(wordCount).toBeGreaterThanOrEqual(2)
          expect(wordCount).toBeLessThanOrEqual(4)
        }
      }
    }
  })

  it('never repeats the exact same phrase chunk within a category', () => {
    for (const category of PHRASE_READING_MODE_CATEGORIES) {
      const chunks = category.sentences.flat()
      const unique = new Set(chunks)
      expect(unique.size).toBe(chunks.length)
    }
  })
})

describe('buildUnitsForCategory', () => {
  it('produces one unit per phrase chunk, with unique ids, for every category', () => {
    for (const category of PHRASE_READING_MODE_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      const totalChunks = category.sentences.flat().length
      expect(units.length).toBe(totalChunks)
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
    expect(PHRASE_READING_MODE_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists the picked category id to its own storage key', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-phrase-reading-mode-last-category']).toBe(picked.id)
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
