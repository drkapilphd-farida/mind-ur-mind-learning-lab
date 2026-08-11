import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SENTENCE_READING_MODE_CATEGORIES,
  TOTAL_SENTENCE_READING_MODE_CATEGORIES,
  buildUnitsForCategory,
  pickSessionCategory,
} from './sentenceReadingModeDataset'

describe('SENTENCE_READING_MODE_CATEGORIES', () => {
  it('has between 20 and 24 categories per spec', () => {
    expect(TOTAL_SENTENCE_READING_MODE_CATEGORIES).toBeGreaterThanOrEqual(20)
    expect(TOTAL_SENTENCE_READING_MODE_CATEGORIES).toBeLessThanOrEqual(24)
  })

  it('gives every category a unique id', () => {
    const ids = new Set(SENTENCE_READING_MODE_CATEGORIES.map((category) => category.id))
    expect(ids.size).toBe(SENTENCE_READING_MODE_CATEGORIES.length)
  })

  it('gives every category a unique label', () => {
    const labels = new Set(SENTENCE_READING_MODE_CATEGORIES.map((category) => category.label))
    expect(labels.size).toBe(SENTENCE_READING_MODE_CATEGORIES.length)
  })

  it('gives every category at least 10 real, non-empty sentences', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
      expect(category.sentences.length).toBeGreaterThanOrEqual(10)
      for (const sentence of category.sentences) {
        expect(sentence.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('never repeats the exact same sentence across two different categories', () => {
    const allSentences = SENTENCE_READING_MODE_CATEGORIES.flatMap((category) => category.sentences)
    const unique = new Set(allSentences)
    expect(unique.size).toBe(allSentences.length)
  })

  // At 250 WPM, 250 words takes 60s and 320 words takes ~77s, so every
  // category's total word count must land in that band for the "60-75
  // second" spec to hold at a real target pace.
  it('gives every category a 250-320 word passage (a true 60-75 second read at 250 WPM)', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
      const wordCount = category.sentences.join(' ').trim().split(/\s+/).length
      expect(wordCount).toBeGreaterThanOrEqual(250)
      expect(wordCount).toBeLessThanOrEqual(320)
    }
  })

  it('gives every category exactly 3 comprehension questions', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
      expect(category.questions.length).toBe(3)
    }
  })

  it('gives every question exactly 4 options and a valid correct-answer index', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
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
    const ids = SENTENCE_READING_MODE_CATEGORIES.flatMap((category) => category.questions.map((question) => question.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never gives one question two identical options', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
      for (const question of category.questions) {
        expect(new Set(question.options).size).toBe(question.options.length)
      }
    }
  })
})

describe('buildUnitsForCategory', () => {
  it('produces exactly one unit per sentence, with unique ids, for every category', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      expect(units.length).toBe(category.sentences.length)
      const ids = new Set(units.map((unit) => unit.id))
      expect(ids.size).toBe(units.length)
    }
  })

  it('never splits a sentence further — each unit text matches its source sentence verbatim', () => {
    for (const category of SENTENCE_READING_MODE_CATEGORIES) {
      const units = buildUnitsForCategory(category)
      units.forEach((unit, index) => {
        expect(unit.text).toBe(category.sentences[index])
      })
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
    expect(SENTENCE_READING_MODE_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists the picked category id to its own storage key', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-sentence-reading-mode-last-category']).toBe(picked.id)
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
