import { describe, it, expect } from 'vitest'
import type { ContentItem } from '@/types/exercise-engine'
import { buildChunkItems, computeChunkMetrics } from './chunkEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { CHUNK_READING_DATASET } from './chunkDataset'

function chunk(id: string, content: string): ContentItem {
  return { id, content, contentLabel: content, difficulty: 'medium', locale: 'en' }
}

describe('buildChunkItems', () => {
  const chunks: ContentItem[] = [
    chunk('c1', 'mental clarity'),
    chunk('c2', 'reading speed'),
    chunk('c3', 'visual attention'),
    chunk('c4', 'brain training'),
    chunk('c5', 'deep focus'),
  ]

  it('returns an empty array for an empty chunk pool', () => {
    expect(buildChunkItems([], 10, 1)).toEqual([])
  })

  it('produces well-formed SessionItems: 4 unique options, correctIndex points at the stimulus', () => {
    const items = buildChunkItems(chunks, 5, 42)
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.options).toHaveLength(4)
      expect(new Set(item.options).size).toBe(4)
      expect(item.correctIndex).toBeGreaterThanOrEqual(0)
      expect(item.correctIndex).toBeLessThan(4)
      expect(item.options[item.correctIndex]).toBe(item.stimulus)
    }
  })

  it('never invents a fallback distractor — every option is a real chunk from the pool', () => {
    const chunkTexts = new Set(chunks.map((c) => c.content))
    const items = buildChunkItems(chunks, 5, 7)
    for (const item of items) {
      for (const option of item.options) {
        expect(chunkTexts.has(option)).toBe(true)
      }
    }
  })

  it('skips a stimulus rather than fabricate a distractor when the pool is too small', () => {
    // Only 2 chunks total — impossible to build a 4-option item (need 3
    // distinct distractors) — must return zero items, not garbage options.
    const tooFew: ContentItem[] = [chunk('c1', 'mental clarity'), chunk('c2', 'reading speed')]
    expect(buildChunkItems(tooFew, 5, 1)).toEqual([])
  })

  it('Visual Width Validator guarantee: every stimulus and every option is visually valid', () => {
    const items = buildChunkItems(chunks, 5, 9)
    for (const item of items) {
      expect(isVisuallyValid(item.stimulus, 'option')).toBe(true)
      for (const option of item.options) {
        expect(isVisuallyValid(option, 'option')).toBe(true)
      }
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildChunkItems(chunks, 5, 99)
    const second = buildChunkItems(chunks, 5, 99)
    expect(second).toEqual(first)
  })

  it('produces IDs unique within a session', () => {
    const items = buildChunkItems(chunks, 5, 5)
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('curated chunk dataset', () => {
  it('every item is a real, meaningful chunk — never a sentence fragment', () => {
    // Regression guard for the exact bug this dataset replaces: mechanical
    // splitting used to produce fragments like "stronger with every".
    // Every curated chunk must be independently readable and visually valid.
    for (const item of CHUNK_READING_DATASET.items) {
      expect(isVisuallyValid(item.content, 'option')).toBe(true)
      expect(item.content.trim().length).toBeGreaterThan(0)
    }
  })

  it('has enough content at every difficulty tier chunkDifficulty.ts expects', () => {
    const tiers: Array<{ tier: string; wordCount: number }> = [
      { tier: 'beginner', wordCount: 2 },
      { tier: 'easy', wordCount: 3 },
      { tier: 'medium', wordCount: 4 },
      { tier: 'advanced', wordCount: 5 },
      { tier: 'expert', wordCount: 6 },
    ]
    for (const { tier, wordCount } of tiers) {
      const atTier = CHUNK_READING_DATASET.items.filter((i) => i.difficulty === tier)
      expect(atTier.length).toBeGreaterThanOrEqual(4)
      for (const item of atTier) {
        expect(item.content.split(/\s+/).filter(Boolean)).toHaveLength(wordCount)
      }
    }
  })
})

describe('computeChunkMetrics', () => {
  it('returns zeros for an empty item list', () => {
    expect(computeChunkMetrics([], 0)).toEqual({ accuracyPercent: 0, totalChunks: 0, avgWordCount: 0 })
  })
})
