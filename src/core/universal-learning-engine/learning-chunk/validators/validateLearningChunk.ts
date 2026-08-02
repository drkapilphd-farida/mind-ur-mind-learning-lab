import type { LearningChunk } from '../types/LearningChunk'
import { blocksToContent } from '../internal/blockText'

// Plain data, not a thrown Error subclass — same Result-type convention
// as UCE-1's UniversalUploadError/UCE-2's ExtractionResult, never
// exception-based control flow for expected failure cases. Unlike those
// single-error results, this collects every violation found (not just
// the first) since a caller repairing a malformed/deserialized chunk
// benefits from seeing the full list at once.
export type LearningChunkValidationResult = { valid: true } | { valid: false; errors: readonly string[] }

function isFiniteInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max
}

function isValidIsoDate(value: string): boolean {
  return value.length > 0 && !Number.isNaN(new Date(value).getTime())
}

// Universal Learning Intelligence Engine™ (ULIE™) — Learning Chunk™
// Architecture Sprint. Real structural invariant checks only — never a
// semantic/quality judgment (that stays UCE-3B/UCE-5's job). Exists so a
// chunk crossing a real boundary (deserialized from storage, received
// over the wire) can be verified before a downstream engine trusts it.
export function validateLearningChunk(chunk: LearningChunk): LearningChunkValidationResult {
  const errors: string[] = []

  if (chunk.id.length === 0) errors.push('id must not be empty')
  if (chunk.version.schemaVersion.length === 0) errors.push('version.schemaVersion must not be empty')
  if (!Number.isInteger(chunk.version.revision) || chunk.version.revision < 1) errors.push('version.revision must be an integer >= 1')

  if (chunk.location.order < 0) errors.push('location.order must not be negative')
  if (chunk.location.totalChunksInDocument < 1) errors.push('location.totalChunksInDocument must be at least 1')
  if (chunk.location.order >= chunk.location.totalChunksInDocument) errors.push('location.order must be less than location.totalChunksInDocument')

  const expectedContent = blocksToContent(chunk.blocks)
  if (chunk.content !== expectedContent) errors.push("content does not match the real text of blocks")

  if (chunk.statistics.characterCount !== chunk.content.length) errors.push('statistics.characterCount does not match content.length')
  if (chunk.statistics.blockCount !== chunk.blocks.length) errors.push('statistics.blockCount does not match blocks.length')
  if (chunk.statistics.wordCount < 0) errors.push('statistics.wordCount must not be negative')
  if (chunk.statistics.tableCount !== chunk.tables.length) errors.push('statistics.tableCount does not match tables.length')
  if (chunk.statistics.mediaCount !== chunk.media.length) errors.push('statistics.mediaCount does not match media.length')

  if (!isFiniteInRange(chunk.confidence.structural, 0, 1)) errors.push('confidence.structural must be between 0 and 1')
  if (chunk.confidence.semantic !== null && !isFiniteInRange(chunk.confidence.semantic, 0, 1)) errors.push('confidence.semantic must be null or between 0 and 1')
  if (chunk.confidence.overall !== null && !isFiniteInRange(chunk.confidence.overall, 0, 1)) errors.push('confidence.overall must be null or between 0 and 1')

  for (const relationship of chunk.relationships) {
    if (relationship.targetChunkId.length === 0) errors.push('relationships[].targetChunkId must not be empty')
    if (relationship.targetChunkId === chunk.id) errors.push('relationships[].targetChunkId must not reference the chunk itself')
    if (relationship.confidence !== null && !isFiniteInRange(relationship.confidence, 0, 1)) errors.push('relationships[].confidence must be null or between 0 and 1')
  }

  if (!isValidIsoDate(chunk.audit.createdAt)) errors.push('audit.createdAt must be a valid ISO date string')
  if (!isValidIsoDate(chunk.audit.lastModifiedAt)) errors.push('audit.lastModifiedAt must be a valid ISO date string')

  if (chunk.hierarchy.depth < 0) errors.push('hierarchy.depth must not be negative')

  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}
