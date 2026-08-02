import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { CostTracker, CostTrackingEntry } from '../types/CostTracker'
import { logger } from '@/lib/logger'

// Production AI Cost Optimization — Task 5. The real, persistent
// CostTracker implementation `InMemoryCostTracker.ts`'s own comment
// already names as the intended future seam: "a future persistent
// (Supabase-table-backed) implementation plugs into without changing
// aiFoundation.ts." Swapped in via the existing
// `AIFoundationDependencies.costTracker` override — zero change to
// `aiFoundation.ts` itself.
//
// `record()` is a synchronous, void-returning method on the real
// `CostTracker` interface (aiFoundation.ts calls it without awaiting), so
// the real Supabase write happens in the background here — failures are
// logged, never thrown, the same "cost tracking never fails the real
// result" precedent aiFoundation.ts's own `recordCost` already
// establishes for the in-memory tracker. An in-memory buffer is kept
// alongside the real writes so `list()`/`totalCostCents()` — used by this
// same processing run to compute its own `document_processing_summary`
// totals — stay real and synchronous, without a second round trip to the
// database it just wrote to.
export function createSupabaseCostTracker(supabase: SupabaseClient<Database>, documentId: string | null): CostTracker {
  const entries: CostTrackingEntry[] = []

  return {
    record(entry: CostTrackingEntry): void {
      entries.push(entry)

      void supabase
        .from('ai_cost_log')
        .insert({
          document_id: documentId,
          chunk_id: entry.requestId,
          feature: entry.task,
          model_id: entry.modelId,
          input_tokens: entry.tokens.inputTokens,
          output_tokens: entry.tokens.outputTokens,
          estimated_cost_cents: entry.actualCost.totalCostCents,
          processing_time_ms: entry.processingTimeMs,
          request_id: entry.requestId,
          success: entry.success,
        })
        .then(({ error }) => {
          if (error) {
            logger.warn('failed to persist ai cost log entry', { error: error.message, requestId: entry.requestId, task: entry.task })
          }
        })
    },

    list(): readonly CostTrackingEntry[] {
      return [...entries]
    },

    totalCostCents(filter: { providerId?: string } = {}): number {
      return entries.filter((entry) => filter.providerId === undefined || entry.providerId === filter.providerId).reduce((sum, entry) => sum + entry.actualCost.totalCostCents, 0)
    },
  }
}
