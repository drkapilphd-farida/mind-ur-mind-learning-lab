// Semantic Enrichment Engine™ — UCE-3B. Every field is optional and has
// a real, disclosed default (see enrichLearningChunk.ts/
// enrichLearningChunks.ts) — no hidden behavior.
export type EnrichmentOptions = {
  // Skip the chunk-level idempotency check ("If enrichment already
  // exists: Reuse it") and re-run enrichment even for an already-
  // `'semantically-enriched'` chunk. Defaults to false.
  forceReprocess?: boolean
  // How long to wait for a single chunk's AIFoundation.execute() call
  // before treating it as a timeout failure. AIFoundation itself has no
  // timeout today (confirmed by reading executeWithRetry.ts) — this is
  // new, additive orchestration logic layered on top, not a change to
  // AIF-1. Defaults to 30_000ms.
  timeoutMs?: number
  // How many chunks enrichLearningChunks() processes concurrently.
  // Defaults to a small constant (see enrichLearningChunks.ts) — real
  // bounded concurrency, not "all chunks at once," so a large document
  // doesn't fire an unbounded burst of requests against AIFoundation's
  // own rate limiter.
  concurrency?: number
  // Injectable clock, matching this codebase's established DI
  // convention (buildLearningChunk's own `options.now`) — real
  // `() => new Date()` in production, overridable for deterministic
  // tests.
  now?: () => Date
}
