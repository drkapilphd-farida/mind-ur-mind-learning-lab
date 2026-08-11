import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  splitIntoChunks,
  buildUnitsForCategory,
  pickSessionCategory,
  VERTICAL_CHUNK_SLIDING_CATEGORIES,
  TOTAL_VERTICAL_CHUNK_SLIDING_CATEGORIES,
} from './verticalChunkSlidingDataset'

describe('splitIntoChunks', () => {
  it('splits an even-length sentence into 4-word groups', () => {
    expect(splitIntoChunks('one two three four five six seven eight')).toEqual(['one two three four', 'five six seven eight'])
  })

  it('never leaves an orphan group smaller than minSize', () => {
    const chunks = splitIntoChunks('one two three four five six seven eight nine')
    for (const chunk of chunks) {
      expect(chunk.split(' ').length).toBeGreaterThanOrEqual(3)
    }
  })

  it('reassembles back to the original words in order', () => {
    const text = 'the quick brown fox jumps over the lazy dog today'
    const chunks = splitIntoChunks(text)
    expect(chunks.join(' ')).toBe(text)
  })
})

describe('VERTICAL_CHUNK_SLIDING_CATEGORIES', () => {
  it('has between 15 and 20 categories per spec', () => {
    expect(TOTAL_VERTICAL_CHUNK_SLIDING_CATEGORIES).toBeGreaterThanOrEqual(15)
    expect(TOTAL_VERTICAL_CHUNK_SLIDING_CATEGORIES).toBeLessThanOrEqual(20)
  })

  it('gives every category a unique id', () => {
    const ids = new Set(VERTICAL_CHUNK_SLIDING_CATEGORIES.map((category) => category.id))
    expect(ids.size).toBe(VERTICAL_CHUNK_SLIDING_CATEGORIES.length)
  })

  it('gives every category a unique label', () => {
    const labels = new Set(VERTICAL_CHUNK_SLIDING_CATEGORIES.map((category) => category.label))
    expect(labels.size).toBe(VERTICAL_CHUNK_SLIDING_CATEGORIES.length)
  })

  it('gives every category at least 3 real sentences', () => {
    for (const category of VERTICAL_CHUNK_SLIDING_CATEGORIES) {
      expect(category.sentences.length).toBeGreaterThanOrEqual(3)
      for (const sentence of category.sentences) {
        expect(sentence.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('never repeats the exact same sentence across two different categories', () => {
    const allSentences = VERTICAL_CHUNK_SLIDING_CATEGORIES.flatMap((category) => category.sentences)
    const unique = new Set(allSentences)
    expect(unique.size).toBe(allSentences.length)
  })
})

describe('buildUnitsForCategory', () => {
  it('produces at least one unit per category, with unique ids', () => {
    for (const category of VERTICAL_CHUNK_SLIDING_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      expect(units.length).toBeGreaterThan(0)
      const ids = new Set(units.map((unit) => unit.id))
      expect(ids.size).toBe(units.length)
    }
  })

  it('every chunk stays within the narrower 2-3 word range (unlike the horizontal sibling)', () => {
    for (const category of VERTICAL_CHUNK_SLIDING_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      for (const unit of units) {
        const wordCount = unit.text.split(' ').length
        expect(wordCount).toBeGreaterThanOrEqual(2)
        expect(wordCount).toBeLessThanOrEqual(3)
      }
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
    expect(VERTICAL_CHUNK_SLIDING_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists the picked category id to localStorage', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-vertical-chunk-sliding-last-category']).toBe(picked.id)
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
