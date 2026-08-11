import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FLASH_RECALL_SPRINT_CATEGORIES,
  TOTAL_FLASH_RECALL_SPRINT_CATEGORIES,
  buildWordsForCategory,
  pickSessionCategory,
} from './flashRecallSprintDataset'

describe('FLASH_RECALL_SPRINT_CATEGORIES', () => {
  it('has between 20 and 25 categories per spec', () => {
    expect(TOTAL_FLASH_RECALL_SPRINT_CATEGORIES).toBeGreaterThanOrEqual(20)
    expect(TOTAL_FLASH_RECALL_SPRINT_CATEGORIES).toBeLessThanOrEqual(25)
  })

  it('gives every category a unique id', () => {
    const ids = new Set(FLASH_RECALL_SPRINT_CATEGORIES.map((category) => category.id))
    expect(ids.size).toBe(FLASH_RECALL_SPRINT_CATEGORIES.length)
  })

  it('gives every category a unique label', () => {
    const labels = new Set(FLASH_RECALL_SPRINT_CATEGORIES.map((category) => category.label))
    expect(labels.size).toBe(FLASH_RECALL_SPRINT_CATEGORIES.length)
  })

  it('never repeats the exact same sentence across two different categories', () => {
    const allSentences = FLASH_RECALL_SPRINT_CATEGORIES.flatMap((category) => category.sentences)
    const unique = new Set(allSentences)
    expect(unique.size).toBe(allSentences.length)
  })

  // A true 1-minute passage — at 250 WPM, 250 words takes 60s and 300
  // words takes 72s, so every category's total word count must land in
  // that band for the "60-75 second" spec to hold at a real target pace.
  it('gives every category a 250-300 word passage (a true 1-minute read at 250 WPM)', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const wordCount = category.sentences.join(' ').trim().split(/\s+/).length
      expect(wordCount).toBeGreaterThanOrEqual(250)
      expect(wordCount).toBeLessThanOrEqual(300)
    }
  })

  it('gives every category exactly 3 comprehension questions', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      expect(category.questions.length).toBe(3)
    }
  })

  it('gives every question exactly 4 options, unique, with a valid correct-answer index', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      for (const question of category.questions) {
        expect(question.options.length).toBe(4)
        expect(new Set(question.options).size).toBe(4)
        expect(question.correctOptionIndex).toBeGreaterThanOrEqual(0)
        expect(question.correctOptionIndex).toBeLessThanOrEqual(3)
        expect(question.question.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('gives every question a globally unique id', () => {
    const ids = FLASH_RECALL_SPRINT_CATEGORIES.flatMap((category) => category.questions.map((question) => question.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('buildWordsForCategory', () => {
  it('splits every category into true single-word RSVP units', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const words = buildWordsForCategory(category)
      expect(words.length).toBeGreaterThan(0)
      for (const word of words) {
        expect(word.length).toBeGreaterThan(0)
        expect(/\s/.test(word)).toBe(false)
      }
    }
  })

  it('reassembles back into the exact original passage when joined with spaces', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const words = buildWordsForCategory(category)
      expect(words.join(' ')).toBe(category.sentences.join(' '))
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
    expect(FLASH_RECALL_SPRINT_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists the picked category id to localStorage', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-flash-recall-sprint-last-category']).toBe(picked.id)
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
