import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'

// Shared Learning Modes helper — Sprint ALS-17 extraction. Moved from the
// identical inline expression duplicated in Mind Map™'s
// `generateMindMapOutline.ts` and Flashcards™'s `generateFlashCards.ts`
// (both ALS-13) — a chunk's real, honest display heading: its own real
// `metadata.title` when present, falling back to its real
// `location.sectionHeading`, falling back to a real positional label
// derived from its real `location.order`. Never fabricated. Reused by
// MCQs™ (ALS-17) for its own real structural questions — this sprint's
// own "do not duplicate parsing" rule, rather than a third inline copy.
export function resolveChunkHeading(chunk: LearningChunk): string {
  return chunk.metadata.title ?? chunk.location.sectionHeading ?? `Section ${chunk.location.order + 1}`
}
