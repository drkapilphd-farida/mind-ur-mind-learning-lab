import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { resolveChunkHeading } from '@/lib/learning-modes/resolveChunkHeading'

export type DocumentSectionHeading = {
  chunkNodeId: string
  order: number
  heading: string
}

// MCQs™ — AI Learning Studio™ Sprint ALS-17. The one piece of whole-
// document data MCQs needs that no other stepped-session mode has ever
// needed: every real section's real heading, not just the current
// chunk's — required to build real distractor options
// (`buildStructureQuestion.ts`). Computed once, server-side, from the
// same real ULO every mode already loads (`loadUniversalLearningObject`)
// — never a second parse of the uploaded document, and reuses the exact
// same real heading-fallback chain (`resolveChunkHeading`) Mind Map™/
// Flashcards™ already established, per this sprint's own "do not
// duplicate parsing" rule.
export function listDocumentSectionHeadings(ulo: UniversalLearningObject): readonly DocumentSectionHeading[] {
  return [...ulo.knowledge.chunks]
    .sort((a, b) => a.location.order - b.location.order)
    .map((chunk) => ({
      chunkNodeId: chunk.id,
      order: chunk.location.order,
      heading: resolveChunkHeading(chunk),
    }))
}
