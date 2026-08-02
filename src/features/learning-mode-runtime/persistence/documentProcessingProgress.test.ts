import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import {
  initializeDocumentProcessingProgress,
  loadDocumentProcessingProgress,
  claimDocumentProcessingProgressLock,
  advanceDocumentProcessingProgress,
} from './documentProcessingProgress'

describe('initializeDocumentProcessingProgress', () => {
  it('upserts a real starting row, ignoring a duplicate for an already-initialized document', async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    await initializeDocumentProcessingProgress(supabase, 'doc-1', 12)

    expect(upsert).toHaveBeenCalledWith({ document_id: 'doc-1', total_chunks: 12, total_chapters: 12 }, { onConflict: 'document_id', ignoreDuplicates: true })
  })
})

describe('loadDocumentProcessingProgress', () => {
  it('loads and maps a real row', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({
                data: {
                  document_id: 'doc-1',
                  stage: 'enriching_chunks',
                  total_chunks: 10,
                  chunks_enriched: 3,
                  knowledge_graph_done: false,
                  learning_analysis_done: false,
                  total_chapters: 10,
                  blueprints_generated: 2,
                  learning_assets_generated: 1,
                  error_message: null,
                },
                error: null,
              }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>

    const progress = await loadDocumentProcessingProgress(supabase, 'doc-1')
    expect(progress).toEqual({
      documentId: 'doc-1',
      stage: 'enriching_chunks',
      totalChunks: 10,
      chunksEnriched: 3,
      knowledgeGraphDone: false,
      learningAnalysisDone: false,
      totalChapters: 10,
      blueprintsGenerated: 2,
      learningAssetsGenerated: 1,
      errorMessage: null,
    })
  })

  it('returns null honestly when no row exists or the query errors', async () => {
    const missing = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) }) } as unknown as SupabaseClient<Database>
    expect(await loadDocumentProcessingProgress(missing, 'doc-1')).toBeNull()

    const erroring = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) }) } as unknown as SupabaseClient<Database>
    expect(await loadDocumentProcessingProgress(erroring, 'doc-1')).toBeNull()
  })
})

describe('claimDocumentProcessingProgressLock', () => {
  it('claims the lock when a row was actually updated', async () => {
    const or = vi.fn(() => ({ select: () => Promise.resolve({ data: [{ document_id: 'doc-1' }], error: null }) }))
    const eq = vi.fn(() => ({ or }))
    const update = vi.fn(() => ({ eq }))
    const supabase = { from: () => ({ update }) } as unknown as SupabaseClient<Database>

    expect(await claimDocumentProcessingProgressLock(supabase, 'doc-1', 45_000)).toBe(true)
  })

  it('does not claim the lock when another call already holds a fresh one (no row updated)', async () => {
    const supabase = {
      from: () => ({ update: () => ({ eq: () => ({ or: () => ({ select: () => Promise.resolve({ data: [], error: null }) }) }) }) }),
    } as unknown as SupabaseClient<Database>

    expect(await claimDocumentProcessingProgressLock(supabase, 'doc-1', 45_000)).toBe(false)
  })

  it('is honest (false) on a real query error', async () => {
    const supabase = {
      from: () => ({ update: () => ({ eq: () => ({ or: () => ({ select: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) }) }),
    } as unknown as SupabaseClient<Database>

    expect(await claimDocumentProcessingProgressLock(supabase, 'doc-1', 45_000)).toBe(false)
  })
})

describe('advanceDocumentProcessingProgress', () => {
  it('applies only the real patched fields, always releasing the lock', async () => {
    const update = vi.fn(() => ({ eq: () => Promise.resolve({ error: null }) }))
    const supabase = { from: () => ({ update }) } as unknown as SupabaseClient<Database>

    const result = await advanceDocumentProcessingProgress(supabase, 'doc-1', { stage: 'building_knowledge_graph', chunksEnriched: 10 })

    expect(result).toBe(true)
    expect(update).toHaveBeenCalledWith({ locked_at: null, stage: 'building_knowledge_graph', chunks_enriched: 10 })
  })

  it('reports failure honestly on a real write error', async () => {
    const supabase = { from: () => ({ update: () => ({ eq: () => Promise.resolve({ error: { message: 'boom' } }) }) }) } as unknown as SupabaseClient<Database>
    expect(await advanceDocumentProcessingProgress(supabase, 'doc-1', { stage: 'failed' })).toBe(false)
  })
})
