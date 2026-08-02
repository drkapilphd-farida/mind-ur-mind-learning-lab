import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { EnrichmentOptions } from './types/EnrichmentOptions'
import type { EnrichmentOutcome } from './types/EnrichmentOutcome'
import { buildEnrichmentPrompt } from './internal/buildEnrichmentPrompt'
import { parseEnrichmentResponse } from './internal/parseEnrichmentResponse'
import { mergeEnrichment } from './internal/mergeEnrichment'
import { isAlreadyEnriched } from './internal/isAlreadyEnriched'

const DEFAULT_TIMEOUT_MS = 30_000

// Races a real AIFoundation.execute() call against a timer. AIFoundation
// itself has no timeout today (confirmed by reading executeWithRetry.ts
// directly — no timeout logic exists in AIF-1) — this is new, additive
// orchestration logic layered on top for this engine's own "Support:
// Timeout" requirement, not a change to AIF-1. `execute()` is documented
// to always resolve (never reject) with a Result-type value, so only a
// `.then` handler is needed here — no defensive catch for a contract
// AIF-1 already guarantees.
function withTimeout(promise: Promise<AIFoundationResult>, timeoutMs: number, requestId: string, startedAt: number, now: () => Date): Promise<AIFoundationResult> {
  return new Promise((resolve) => {
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve({
        success: false,
        task: 'semantic-enrichment',
        requestId,
        error: { code: 'timeout', message: `Enrichment request exceeded ${timeoutMs}ms.`, providerId: 'ai-foundation', retryable: true },
        processingTimeMs: now().getTime() - startedAt,
      })
    }, timeoutMs)

    void promise.then((result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    })
  })
}

// Semantic Enrichment Engine™ — UCE-3B. The single-chunk orchestrator:
// idempotency check -> build prompt -> AIFoundation.execute() (the ONLY
// AI gateway — never Claude/Anthropic/another provider directly) ->
// parse -> merge -> one EnrichmentOutcome. Never throws for an expected
// AI/parse failure — always returns a Result-type outcome, so
// enrichLearningChunks() can skip a failed chunk and continue with the
// rest. The original `chunk` is never mutated; a real, new LearningChunk
// is only ever returned inside an `'enriched'`/`'skipped'` outcome.
export async function enrichLearningChunk(
  chunk: LearningChunk,
  document: UniversalLearningDocument,
  aiFoundation: Pick<AIFoundation, 'execute'>,
  options: EnrichmentOptions = {},
): Promise<EnrichmentOutcome> {
  const now = options.now ?? (() => new Date())

  if (!options.forceReprocess && isAlreadyEnriched(chunk)) {
    return {
      chunkId: chunk.id,
      status: 'skipped',
      chunk,
      reason: 'Chunk already has real UCE-3B enrichment data — pass options.forceReprocess to override.',
    }
  }

  const payload = buildEnrichmentPrompt(chunk, document)
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const startedAt = now().getTime()

  const result = await withTimeout(aiFoundation.execute('semantic-enrichment', payload, chunk.id), timeoutMs, chunk.id, startedAt, now)

  if (!result.success) {
    return { chunkId: chunk.id, status: 'failed', error: result.error, processingTimeMs: result.processingTimeMs }
  }

  const parsed = parseEnrichmentResponse(result.response.content)
  const enrichedChunk = mergeEnrichment(chunk, parsed.enrichment, parsed.confidence, {
    now,
    ...(options.forceReprocess ? { changeSummary: 'Re-enriched via UCE-3B semantic-enrichment task (forced reprocessing).' } : {}),
  })

  return { chunkId: chunk.id, status: 'enriched', chunk: enrichedChunk, cacheHit: result.cacheHit, processingTimeMs: result.processingTimeMs }
}
