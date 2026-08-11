import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FLASH_RECALL_SPRINT_CATEGORIES as FR_CATEGORIES } from '@/features/flash-recall-sprint/flashRecallSprintDataset'
import { FLASH_RECALL_SPRINT_CATEGORIES, TOTAL_FLASH_RECALL_SPRINT_CATEGORIES, buildWordsForCategory, pickSessionCategory } from './verticalFlashRecallDataset'

describe('shared content re-export', () => {
  it('re-exports the exact same 25-module content library as Flash Recall Sprint, not a copy', () => {
    expect(FLASH_RECALL_SPRINT_CATEGORIES).toBe(FR_CATEGORIES)
    expect(TOTAL_FLASH_RECALL_SPRINT_CATEGORIES).toBe(FR_CATEGORIES.length)
  })

  it('has between 20 and 25 categories per the original spec', () => {
    expect(TOTAL_FLASH_RECALL_SPRINT_CATEGORIES).toBeGreaterThanOrEqual(20)
    expect(TOTAL_FLASH_RECALL_SPRINT_CATEGORIES).toBeLessThanOrEqual(25)
  })
})

describe('buildWordsForCategory', () => {
  it('splits every category into true single-word RSVP units', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const words = buildWordsForCategory(category)
      expect(words.length).toBeGreaterThan(0)
      for (const word of words) {
        expect(/\s/.test(word)).toBe(false)
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

  it('always returns a real category from the shared list', () => {
    const picked = pickSessionCategory()
    expect(FLASH_RECALL_SPRINT_CATEGORIES.some((category) => category.id === picked.id)).toBe(true)
  })

  it('persists to its OWN storage key, independent of Flash Recall Sprint’s own rotation', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-vertical-flash-recall-last-category']).toBe(picked.id)
    expect(store['qsr-flash-recall-sprint-last-category']).toBeUndefined()
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
