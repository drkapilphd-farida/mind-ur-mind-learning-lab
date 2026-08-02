import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { loadDocumentChunkCache, saveDocumentChunkCacheEntries } from './documentChunkCache'

const REAL_CHUNK = { id: 'chunk-0', status: 'semantically-enriched', content: 'Photosynthesis converts light into chemical energy.', enrichment: { concepts: ['photosynthesis'] } } as unknown as LearningChunk

describe('loadDocumentChunkCache', () => {
  it('loads real cached rows keyed by chunk_order', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () =>
            Promise.resolve({
              data: [{ chunk_order: 0, content_hash: 'real-hash', data: REAL_CHUNK }],
              error: null,
            }),
        }),
      }),
    } as unknown as SupabaseClient<Database>

    const cache = await loadDocumentChunkCache(supabase, 'doc-1')
    expect(cache.size).toBe(1)
    expect(cache.get(0)).toEqual({ chunkOrder: 0, contentHash: 'real-hash', chunk: REAL_CHUNK })
  })

  it('skips a malformed row rather than trusting it, and returns an empty map on a real query error', async () => {
    const malformedSupabase = {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [{ chunk_order: 0, content_hash: 'x', data: { not: 'a chunk' } }], error: null }),
        }),
      }),
    } as unknown as SupabaseClient<Database>
    expect((await loadDocumentChunkCache(malformedSupabase, 'doc-1')).size).toBe(0)

    const erroringSupabase = {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: { message: 'boom' } }),
        }),
      }),
    } as unknown as SupabaseClient<Database>
    expect((await loadDocumentChunkCache(erroringSupabase, 'doc-1')).size).toBe(0)
  })
})

describe('saveDocumentChunkCacheEntries', () => {
  it('upserts real entries and reports success', async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    const result = await saveDocumentChunkCacheEntries(supabase, 'doc-1', [{ chunkOrder: 0, contentHash: 'real-hash', chunk: REAL_CHUNK }])

    expect(result).toBe(true)
    expect(upsert).toHaveBeenCalledWith([{ document_id: 'doc-1', chunk_order: 0, content_hash: 'real-hash', data: REAL_CHUNK }], { onConflict: 'document_id,chunk_order' })
  })

  it('is a real no-op when there is nothing to cache', async () => {
    const upsert = vi.fn()
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    expect(await saveDocumentChunkCacheEntries(supabase, 'doc-1', [])).toBe(true)
    expect(upsert).not.toHaveBeenCalled()
  })

  it('reports failure honestly on a real write error', async () => {
    const supabase = { from: () => ({ upsert: () => Promise.resolve({ error: { message: 'boom' } }) }) } as unknown as SupabaseClient<Database>
    expect(await saveDocumentChunkCacheEntries(supabase, 'doc-1', [{ chunkOrder: 0, contentHash: 'h', chunk: REAL_CHUNK }])).toBe(false)
  })
})
