import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GUIDED_PARAGRAPH_READING_MODE_CATEGORIES,
  TOTAL_GUIDED_PARAGRAPH_READING_MODE_CATEGORIES,
  buildUnitsForCategory,
  pickSessionCategory,
} from './guidedParagraphReadingModeDataset'

describe('GUIDED_PARAGRAPH_READING_MODE_CATEGORIES', () => {
  it('has between 20 and 24 categories per spec', () => {
    expect(TOTAL_GUIDED_PARAGRAPH_READING_MODE_CATEGORIES).toBeGreaterThanOrEqual(20)
    expect(TOTAL_GUIDED_PARAGRAPH_READING_MODE_CATEGORIES).toBeLessThanOrEqual(24)
  })

  it('gives every category a unique id', () => {
    const ids = new Set(GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.map((category) => category.id))
    expect(ids.size).toBe(GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.length)
  })

  it('gives every category a unique label', () => {
    const labels = new Set(GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.map((category) => category.label))
    expect(labels.size).toBe(GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.length)
  })

  it('never repeats the exact same passage text across two different categories', () => {
    const allTexts = GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.map((category) => category.text)
    const unique = new Set(allTexts)
    expect(unique.size).toBe(allTexts.length)
  })

  it('gives every category a 250-350 word full-length passage', () => {
    for (const category of GUIDED_PARAGRAPH_READING_MODE_CATEGORIES) {
      const wordCount = category.text.trim().split(/\s+/).length
      expect(wordCount).toBeGreaterThanOrEqual(250)
      expect(wordCount).toBeLessThanOrEqual(350)
    }
  })

  it('gives every category exactly 3 comprehension questions', () => {
    for (const category of GUIDED_PARAGRAPH_READING_MODE_CATEGORIES) {
      expect(category.questions.length).toBe(3)
    }
  })

  it('gives every question exactly 4 options and a valid correct-answer index', () => {
    for (const category of GUIDED_PARAGRAPH_READING_MODE_CATEGORIES) {
      for (const question of category.questions) {
        expect(question.options.length).toBe(4)
        expect(question.correctOptionIndex).toBeGreaterThanOrEqual(0)
        expect(question.correctOptionIndex).toBeLessThanOrEqual(3)
        expect(question.question.trim().length).toBeGreaterThan(0)
        for (const option of question.options) {
          expect(option.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('gives every question a globally unique id', () => {
    const ids = GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.flatMap((category) => category.questions.map((question) => question.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never gives one question two identical options', () => {
    for (const category of GUIDED_PARAGRAPH_READING_MODE_CATEGORIES) {
      for (const question of category.questions) {
        expect(new Set(question.options).size).toBe(question.options.length)
      }
    }
  })
})

describe('buildUnitsForCategory', () => {
  it('produces exactly one unit per real word, with unique ids, for every category', () => {
    for (const category of GUIDED_PARAGRAPH_READING_MODE_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      const expectedWordCount = category.text.trim().split(/\s+/).filter(Boolean).length
      expect(units.length).toBe(expectedWordCount)
      const ids = new Set(units.map((unit) => unit.id))
      expect(ids.size).toBe(units.length)
    }
  })

  it('preserves word order — joining unit text back together reconstructs the original passage', () => {
    for (const category of GUIDED_PARAGRAPH_READING_MODE_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      expect(units.map((unit) => unit.text).join(' ')).toBe(category.text.trim().split(/\s+/).filter(Boolean).join(' '))
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
    expect(GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists the picked category id to its own storage key', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-guided-paragraph-reading-mode-last-category']).toBe(picked.id)
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
