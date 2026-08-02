import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { saveDocumentProcessingSummary } from './documentProcessingSummary'

const SUMMARY = {
  totalChunks: 5,
  processedChunks: 2,
  reusedChunks: 3,
  claudeCalls: 2,
  skippedCalls: 3,
  inputTokens: 1000,
  outputTokens: 200,
  estimatedCostCents: 12.5,
  processingTimeMs: 4000,
}

describe('saveDocumentProcessingSummary', () => {
  it('upserts one real row keyed by document_id', async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient<Database>

    const result = await saveDocumentProcessingSummary(supabase, 'doc-1', SUMMARY)

    expect(result).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('document_processing_summary')
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        document_id: 'doc-1',
        total_chunks: 5,
        processed_chunks: 2,
        reused_chunks: 3,
        claude_calls: 2,
        skipped_calls: 3,
        input_tokens: 1000,
        output_tokens: 200,
        estimated_cost_cents: 12.5,
        processing_time_ms: 4000,
      }),
      { onConflict: 'document_id' },
    )
  })

  it('reports failure honestly on a real write error', async () => {
    const supabase = { from: () => ({ upsert: () => Promise.resolve({ error: { message: 'boom' } }) }) } as unknown as SupabaseClient<Database>
    expect(await saveDocumentProcessingSummary(supabase, 'doc-1', SUMMARY)).toBe(false)
  })
})
