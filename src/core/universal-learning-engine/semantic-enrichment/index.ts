// Universal Learning Intelligence Engine™ (ULIE™) — Semantic Enrichment
// Engine™ (UCE-3B). The one import path every downstream engine (UCE-4
// onward) and every caller uses — never import from types/internal
// directly.

export { enrichLearningChunk } from './enrichLearningChunk'
export { enrichLearningChunks } from './enrichLearningChunks'
export type { EnrichmentOptions, EnrichmentOutcome, BatchEnrichmentResult } from './types'
