import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// Production AI Cost Optimization — Task 6. One upsert per finished
// processing run into `document_processing_summary`
// (supabase/migrations/20260724000003_create_document_processing_summary.sql).
// Every field here is a real counter the caller already computed from this
// run's own chunk-cache split (Task 2) and cost-tracker entries (Task 5) —
// this module does no aggregation of its own, only persistence.
export type DocumentProcessingSummaryInput = {
  totalChunks: number
  processedChunks: number
  reusedChunks: number
  claudeCalls: number
  skippedCalls: number
  inputTokens: number
  outputTokens: number
  estimatedCostCents: number
  processingTimeMs: number
}

export async function saveDocumentProcessingSummary(supabase: SupabaseClient<Database>, documentId: string, summary: DocumentProcessingSummaryInput): Promise<boolean> {
  const { error } = await supabase.from('document_processing_summary').upsert(
    {
      document_id: documentId,
      total_chunks: summary.totalChunks,
      processed_chunks: summary.processedChunks,
      reused_chunks: summary.reusedChunks,
      claude_calls: summary.claudeCalls,
      skipped_calls: summary.skippedCalls,
      input_tokens: summary.inputTokens,
      output_tokens: summary.outputTokens,
      estimated_cost_cents: summary.estimatedCostCents,
      processing_time_ms: summary.processingTimeMs,
    },
    { onConflict: 'document_id' },
  )

  if (error) {
    logger.error('failed to save document processing summary', { error: error.message, documentId })
    return false
  }

  return true
}
