import type { AIError } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'

// Semantic Enrichment Engine™ — UCE-3B. Plain data, not a thrown Error —
// the same Result-type convention as every other engine in this arc
// (AIFoundationResult, ExtractionResult, LearningChunkValidationResult).
// One outcome per input chunk, always — a batch run never throws away a
// chunk's result, even on failure, so "skip failed chunk, continue
// remaining chunks" has something real to report per chunk.
export type EnrichmentOutcome =
  | {
      chunkId: string
      status: 'enriched'
      // The NEW LearningChunk (same id/content/blocks/source as the
      // input — see mergeEnrichment.ts — never the original object).
      chunk: LearningChunk
      cacheHit: boolean
      processingTimeMs: number
    }
  | {
      chunkId: string
      status: 'skipped'
      // The unchanged input chunk, returned as-is — already enriched,
      // nothing new was requested from AIFoundation this run.
      chunk: LearningChunk
      reason: string
    }
  | {
      chunkId: string
      status: 'failed'
      error: AIError
      processingTimeMs: number
    }
