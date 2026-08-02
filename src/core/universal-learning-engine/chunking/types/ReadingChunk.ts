import type { LearningContentBlock } from '@/core/universal-learning-engine/extraction'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-3A.
// ReadingChunk™ — a stable, deterministic slice of a document's real
// structure. Nothing in this engine is mock content, and nothing is
// random — the same UniversalLearningDocument always produces byte-identical
// chunks, same ids, same order, every time.
export type ReadingChunk = {
  id: string
  documentId: string
  order: number
  // Inherited from the source section — never fabricated. `null` when
  // the section itself has no heading (content before a document's first
  // heading, or a heading-less format like TXT).
  heading: string | null
  sectionId: string
  // Real content blocks, in real reading order — never re-authored,
  // summarized, or reordered.
  blocks: readonly LearningContentBlock[]
  wordCount: number
  hasTable: boolean
  hasImage: boolean
}

export type ChunkedLearningDocument = {
  documentId: string
  chunks: readonly ReadingChunk[]
  chunkCount: number
  totalWordCount: number
  // Explicit UCE-3B hook. Always null this sprint — Phase A is
  // deterministic structural chunking only, zero AI/embeddings. A future
  // sprint adds real embedding-based topic/concept enrichment here
  // without this shape changing for anything that already consumes it.
  semanticEnrichment: null
}
