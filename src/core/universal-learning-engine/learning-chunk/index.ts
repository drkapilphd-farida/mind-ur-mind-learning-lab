// Universal Learning Intelligence Engine™ (ULIE™) — Learning Chunk™
// Architecture Sprint. The one import path every downstream engine
// (UCE-3B onward) and every Learning Mode uses — never import from
// types/builders/validators/serialization/factories directly.

export { buildLearningChunk, buildLearningChunks } from './builders/buildLearningChunk'
export type { BuildLearningChunkOptions } from './builders/buildLearningChunk'
export { validateLearningChunk } from './validators/validateLearningChunk'
export type { LearningChunkValidationResult } from './validators/validateLearningChunk'
export { serializeLearningChunk, deserializeLearningChunk } from './serialization/learningChunkSerializer'
export type { DeserializeLearningChunkResult } from './serialization/learningChunkSerializer'
export { createEmptyChunkEnrichment } from './factories/createEmptyChunkEnrichment'

export type {
  LearningChunk,
  ChunkStatus,
  ChunkVersion,
  ChunkMetadata,
  ChunkReference,
  ChunkSource,
  ChunkLocation,
  ChunkStatistics,
  ChunkReadingMetrics,
  ChunkRelationshipType,
  ChunkRelationshipOrigin,
  ChunkRelationship,
  ChunkHierarchy,
  ChunkConfidence,
  ChunkAuditActor,
  ChunkAuditEntry,
  ChunkAudit,
  ChunkMedia,
  ChunkTable,
  ChunkFormula,
  ChunkCode,
  ChunkCitation,
  ChunkLanguage,
  ChunkAccessibility,
  ChunkTags,
  ChunkExtensions,
  ChunkBloomsLevel,
  ChunkDifficulty,
  ChunkDefinition,
  ChunkEnrichment,
} from './types'
