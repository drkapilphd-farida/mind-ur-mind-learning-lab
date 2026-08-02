import type { EnrichmentOutcome } from './EnrichmentOutcome'

// Semantic Enrichment Engine™ — UCE-3B. Real, computed-today aggregate
// counts over `outcomes` — the one place they're computed, so no future
// consumer re-derives them differently (same pattern as UCE-3A's
// ChunkedLearningDocument.chunkCount).
export type BatchEnrichmentResult = {
  documentId: string
  outcomes: readonly EnrichmentOutcome[]
  enrichedCount: number
  skippedCount: number
  failedCount: number
}
