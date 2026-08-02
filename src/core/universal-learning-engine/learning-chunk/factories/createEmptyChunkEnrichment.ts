import type { ChunkEnrichment } from '../types/ChunkEnrichment'

// The one place `{}` (an all-absent ChunkEnrichment) is constructed —
// used by buildLearningChunk today, and by UCE-3B/4/5 tomorrow as the
// real starting point they merge real enrichment fields into, so no
// future engine re-invents "what does 'nothing enriched yet' look like."
export function createEmptyChunkEnrichment(): ChunkEnrichment {
  return {}
}
