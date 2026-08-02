import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { CostTrackingEntry } from '../types/CostTracker'
import { createSupabaseCostTracker } from './createSupabaseCostTracker'

function makeEntry(overrides: Partial<CostTrackingEntry> = {}): CostTrackingEntry {
  return {
    requestId: 'chunk-0',
    task: 'semantic-enrichment',
    providerId: 'claude',
    modelId: 'claude-sonnet-5',
    tokens: { inputTokens: 1000, outputTokens: 200, totalTokens: 1200 },
    estimatedCost: { inputCostCents: 30, outputCostCents: 30, totalCostCents: 60, currency: 'USD' },
    actualCost: { inputCostCents: 30, outputCostCents: 30, totalCostCents: 60, currency: 'USD' },
    processingTimeMs: 500,
    cacheHit: false,
    occurredAt: '2026-01-01T00:00:00.000Z',
    success: true,
    ...overrides,
  }
}

describe('createSupabaseCostTracker', () => {
  it('keeps a real in-memory record for list()/totalCostCents(), matching InMemoryCostTracker\'s own contract', () => {
    const insert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: () => ({ insert }) } as unknown as SupabaseClient<Database>
    const tracker = createSupabaseCostTracker(supabase, 'doc-1')

    tracker.record(makeEntry())
    tracker.record(makeEntry({ requestId: 'chunk-1', actualCost: { inputCostCents: 10, outputCostCents: 10, totalCostCents: 20, currency: 'USD' } }))

    expect(tracker.list()).toHaveLength(2)
    expect(tracker.totalCostCents()).toBe(80)
  })

  it('writes a real row to ai_cost_log per record(), reusing the entry\'s own requestId as chunk_id', () => {
    const insert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: vi.fn(() => ({ insert })) } as unknown as SupabaseClient<Database>
    const tracker = createSupabaseCostTracker(supabase, 'doc-1')

    tracker.record(makeEntry())

    expect(supabase.from).toHaveBeenCalledWith('ai_cost_log')
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        document_id: 'doc-1',
        chunk_id: 'chunk-0',
        feature: 'semantic-enrichment',
        model_id: 'claude-sonnet-5',
        input_tokens: 1000,
        output_tokens: 200,
        request_id: 'chunk-0',
        success: true,
      }),
    )
  })

  it('never throws when the real write fails — cost tracking stays observability-only', () => {
    const supabase = { from: () => ({ insert: () => Promise.resolve({ error: { message: 'boom' } }) }) } as unknown as SupabaseClient<Database>
    const tracker = createSupabaseCostTracker(supabase, 'doc-1')

    expect(() => tracker.record(makeEntry())).not.toThrow()
  })
})
