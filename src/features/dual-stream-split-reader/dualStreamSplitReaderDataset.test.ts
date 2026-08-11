import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FLASH_RECALL_SPRINT_CATEGORIES as FR_CATEGORIES } from '@/features/flash-recall-sprint/flashRecallSprintDataset'
import { FLASH_RECALL_SPRINT_CATEGORIES, TOTAL_FLASH_RECALL_SPRINT_CATEGORIES, buildDualStreamsForCategory, pickSessionCategory } from './dualStreamSplitReaderDataset'

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

describe('buildDualStreamsForCategory', () => {
  it('produces two streams of exactly equal length for every category', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const { leftUnits, rightUnits } = buildDualStreamsForCategory(category)
      expect(leftUnits.length).toBeGreaterThan(0)
      expect(leftUnits.length).toBe(rightUnits.length)
    }
  })

  it('never produces an empty chunk on either side', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const { leftUnits, rightUnits } = buildDualStreamsForCategory(category)
      for (const chunk of [...leftUnits, ...rightUnits]) {
        expect(chunk.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps every pair a genuine left/right split of the same 6-word group, in original order', () => {
    const category = FLASH_RECALL_SPRINT_CATEGORIES[0]!
    const { leftUnits, rightUnits } = buildDualStreamsForCategory(category)
    const sourceWords = category.sentences.join(' ').trim().split(/\s+/).filter(Boolean)
    const reconstructed = leftUnits.flatMap((left, i) => [...left.split(' '), ...rightUnits[i]!.split(' ')])
    // Reconstructed words must appear as a subsequence of the source, in
    // order (a trailing unsplittable remainder may be dropped, never
    // reordered or duplicated).
    let cursor = 0
    for (const word of reconstructed) {
      const foundAt = sourceWords.indexOf(word, cursor)
      expect(foundAt).toBeGreaterThanOrEqual(cursor)
      cursor = foundAt + 1
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

  it('persists to its OWN storage key, independent of every other reused-content mode', () => {
    const picked = pickSessionCategory()
    expect(store['qsr-dual-stream-split-reader-last-category']).toBe(picked.id)
    expect(store['qsr-flash-recall-sprint-last-category']).toBeUndefined()
    expect(store['qsr-vertical-flash-recall-last-category']).toBeUndefined()
    expect(store['qsr-subvocalization-destroyer-last-category']).toBeUndefined()
    expect(store['qsr-photographic-reading-last-category']).toBeUndefined()
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
