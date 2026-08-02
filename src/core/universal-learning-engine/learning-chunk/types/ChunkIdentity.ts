import type { UniversalSourceType } from '@/core/universal-learning-engine/upload'

// Learning Chunk™ (canonical domain model). A small, reusable pointer to
// another chunk — used inside ChunkRelationship/ChunkHierarchy so those
// models don't each invent their own "which chunk, which document" shape.
export type ChunkReference = {
  chunkId: string
  documentId: string
}

// Full traceability back through UCE-2 (UniversalLearningDocument →
// LearningSection) and UCE-1 (UniversalSource) — "maintain document
// traceability," satisfied without ever re-embedding PDF/DOCX/raw text
// itself. Every field here is real, derived directly from data UCE-1/
// UCE-2/UCE-3A already produced — nothing inferred.
export type ChunkSource = {
  documentId: string
  universalSourceId: string
  sectionId: string
  originalSourceType: UniversalSourceType
}
