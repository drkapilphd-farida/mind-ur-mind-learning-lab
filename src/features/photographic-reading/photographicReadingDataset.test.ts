import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FLASH_RECALL_SPRINT_CATEGORIES as FR_CATEGORIES } from '@/features/flash-recall-sprint/flashRecallSprintDataset'
import {
  FLASH_RECALL_SPRINT_CATEGORIES,
  TOTAL_FLASH_RECALL_SPRINT_CATEGORIES,
  buildSpatialClustersForCategory,
  splitIntoSpatialClusters,
  pickSessionCategory,
} from './photographicReadingDataset'

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

describe('splitIntoSpatialClusters', () => {
  it('splits a clean multiple into clusters of 3-5 words, never a lone-word orphan', () => {
    const clusters = splitIntoSpatialClusters('one two three four five six seven eight nine ten eleven')
    for (const cluster of clusters) {
      const wordCount = cluster.trim().split(/\s+/).length
      expect(wordCount).toBeGreaterThanOrEqual(3)
      expect(wordCount).toBeLessThanOrEqual(5)
    }
  })

  it('keeps every original word, in order, across all clusters', () => {
    const sentence = 'the quick brown fox jumps over the lazy dog again today'
    const clusters = splitIntoSpatialClusters(sentence)
    expect(clusters.join(' ')).toBe(sentence)
  })
})

describe('buildSpatialClustersForCategory', () => {
  it('produces real, non-empty spatial clusters for every category', () => {
    for (const category of FLASH_RECALL_SPRINT_CATEGORIES) {
      const clusters = buildSpatialClustersForCategory(category)
      expect(clusters.length).toBeGreaterThan(0)
      for (const cluster of clusters) {
        expect(cluster.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('preserves every word of the category, in order', () => {
    const category = FLASH_RECALL_SPRINT_CATEGORIES[0]!
    const clusters = buildSpatialClustersForCategory(category)
    expect(clusters.join(' ')).toBe(category.sentences.join(' '))
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
    expect(store['qsr-photographic-reading-last-category']).toBe(picked.id)
    expect(store['qsr-flash-recall-sprint-last-category']).toBeUndefined()
    expect(store['qsr-vertical-flash-recall-last-category']).toBeUndefined()
    expect(store['qsr-subvocalization-destroyer-last-category']).toBeUndefined()
  })

  it('never picks the same category twice in a row', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const first = pickSessionCategory()
      const second = pickSessionCategory()
      expect(second.id).not.toBe(first.id)
    }
  })
})
