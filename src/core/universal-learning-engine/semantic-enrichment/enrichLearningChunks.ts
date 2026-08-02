import type { AIFoundation } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { EnrichmentOptions } from './types/EnrichmentOptions'
import type { EnrichmentOutcome } from './types/EnrichmentOutcome'
import type { BatchEnrichmentResult } from './types/BatchEnrichmentResult'
import { enrichLearningChunk } from './enrichLearningChunk'

// A small default — "process intelligently... respect rate limits,"
// real bounded concurrency rather than firing every chunk's request at
// once. AIFoundation's own RateLimiter still governs the true request/
// token budget; this cap exists so a large document doesn't open
// hundreds of concurrent in-flight requests against it simultaneously.
const DEFAULT_CONCURRENCY = 3

// A minimal worker-pool: `workerCount` loops each pull the next unclaimed
// item until none remain, so at most `concurrency` chunks are being
// enriched at once, in real, real-order-independent parallel execution
// (results are still written back to their original index).
async function runWithConcurrency<T, R>(items: readonly T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function runNext(): Promise<void> {
    const currentIndex = nextIndex
    nextIndex += 1
    if (currentIndex >= items.length) return
    results[currentIndex] = await worker(items[currentIndex] as T)
    await runNext()
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: workerCount }, () => runNext()))
  return results
}

// Semantic Enrichment Engine™ — UCE-3B. The batch orchestrator: enriches
// every chunk in `chunks` (all real, all sharing `document`), bounded
// concurrency, one failed chunk never stops the rest ("skip failed
// chunk, continue remaining chunks" — every chunk gets its own
// EnrichmentOutcome via enrichLearningChunk, never a thrown exception).
// "Resume": calling this again with the same `chunks` array skips every
// chunk enrichLearningChunk's own idempotency check already recognizes
// as enriched, and retries whatever previously failed or was never
// reached — no separate persistence layer needed, consistent with
// AIF-1's own in-memory-only scope disclosure.
export async function enrichLearningChunks(
  chunks: readonly LearningChunk[],
  document: UniversalLearningDocument,
  aiFoundation: Pick<AIFoundation, 'execute'>,
  options: EnrichmentOptions = {},
): Promise<BatchEnrichmentResult> {
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY
  const outcomes: readonly EnrichmentOutcome[] = await runWithConcurrency(chunks, concurrency, (chunk) => enrichLearningChunk(chunk, document, aiFoundation, options))

  return {
    documentId: document.id,
    outcomes,
    enrichedCount: outcomes.filter((outcome) => outcome.status === 'enriched').length,
    skippedCount: outcomes.filter((outcome) => outcome.status === 'skipped').length,
    failedCount: outcomes.filter((outcome) => outcome.status === 'failed').length,
  }
}
