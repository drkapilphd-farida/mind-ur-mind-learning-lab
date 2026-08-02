import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildChunkedLearningDocument } from './services/buildChunkedLearningDocument'
import { DEFAULT_TARGET_WORDS_PER_CHUNK } from './services/chunkSections'
import type { ChunkedLearningDocument } from './types/ReadingChunk'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-3A. The
// one public entry point — every future consumer (UCE-4 onward) calls
// this, never chunkSections/buildChunkedLearningDocument directly.
// Deterministic structural chunking only: no AI, no embeddings, no
// summaries. See docs/PRODUCTION_HANDOFF_UCE_3A.md for the disclosed
// UCE-3B (semantic enrichment) hook this output is designed to receive
// later without changing shape.
export function chunkUniversalLearningDocument(document: UniversalLearningDocument, targetWordsPerChunk: number = DEFAULT_TARGET_WORDS_PER_CHUNK): ChunkedLearningDocument {
  return buildChunkedLearningDocument(document, targetWordsPerChunk)
}
