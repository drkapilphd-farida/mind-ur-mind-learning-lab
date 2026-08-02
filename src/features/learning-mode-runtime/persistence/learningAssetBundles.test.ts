import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import { loadLearningAssetBundles, saveLearningAssetBundle } from './learningAssetBundles'

const REAL_BUNDLE = {
  bundleId: 'bundle-1',
  documentId: 'doc-1',
  chapterId: 'chunk-0',
  version: 1,
  learningObjects: [],
  keywordAssets: [],
  wordAssets: [],
  phraseAssets: [],
  sentenceAssets: [],
  paragraphAssets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
} as unknown as LearningAssetBundle

describe('loadLearningAssetBundles', () => {
  it('loads real cached rows keyed by chapter_order', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [{ chapter_order: 0, content_hash: 'real-hash', data: REAL_BUNDLE }], error: null }),
        }),
      }),
    } as unknown as SupabaseClient<Database>

    const cache = await loadLearningAssetBundles(supabase, 'doc-1')
    expect(cache.size).toBe(1)
    expect(cache.get(0)).toEqual({ chapterOrder: 0, contentHash: 'real-hash', bundle: REAL_BUNDLE })
  })

  it('skips a malformed row rather than trusting it, and returns an empty map on a real query error', async () => {
    const malformed = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [{ chapter_order: 0, content_hash: 'x', data: { not: 'a bundle' } }], error: null }) }) }) } as unknown as SupabaseClient<Database>
    expect((await loadLearningAssetBundles(malformed, 'doc-1')).size).toBe(0)

    const erroring = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) } as unknown as SupabaseClient<Database>
    expect((await loadLearningAssetBundles(erroring, 'doc-1')).size).toBe(0)
  })
})

describe('saveLearningAssetBundle', () => {
  it('upserts a real entry and reports success', async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    const result = await saveLearningAssetBundle(supabase, 'doc-1', { chapterOrder: 0, contentHash: 'real-hash', bundle: REAL_BUNDLE })

    expect(result).toBe(true)
    expect(upsert).toHaveBeenCalledWith({ document_id: 'doc-1', chapter_order: 0, content_hash: 'real-hash', data: REAL_BUNDLE }, { onConflict: 'document_id,chapter_order' })
  })

  it('reports failure honestly on a real write error', async () => {
    const supabase = { from: () => ({ upsert: () => Promise.resolve({ error: { message: 'boom' } }) }) } as unknown as SupabaseClient<Database>
    expect(await saveLearningAssetBundle(supabase, 'doc-1', { chapterOrder: 0, contentHash: 'h', bundle: REAL_BUNDLE })).toBe(false)
  })
})
