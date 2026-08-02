import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { ChunkedLearningDocument } from '../types/ReadingChunk'
import { chunkSections, DEFAULT_TARGET_WORDS_PER_CHUNK } from './chunkSections'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-3A. Pure
// assembly wrapping chunkSections — the one place chunkCount/
// totalWordCount are computed, so no future consumer re-derives them
// differently. `semanticEnrichment` is always null this sprint (see
// ReadingChunk.ts's own comment — the explicit UCE-3B hook).
export function buildChunkedLearningDocument(document: UniversalLearningDocument, targetWordsPerChunk = DEFAULT_TARGET_WORDS_PER_CHUNK): ChunkedLearningDocument {
  const chunks = chunkSections(document.id, document.sections, targetWordsPerChunk)

  return {
    documentId: document.id,
    chunks,
    chunkCount: chunks.length,
    totalWordCount: chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
    semanticEnrichment: null,
  }
}
