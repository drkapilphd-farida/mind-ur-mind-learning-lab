// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-3A. The
// one import path every consumer (UCE-4 onward) uses — never import from
// services/ directly.

export { chunkUniversalLearningDocument } from './universalChunkEngine'
export { DEFAULT_TARGET_WORDS_PER_CHUNK } from './services/chunkSections'
export type { ChunkedLearningDocument, ReadingChunk } from './types/ReadingChunk'
