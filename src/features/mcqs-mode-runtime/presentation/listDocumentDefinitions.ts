import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

export type DocumentDefinition = {
  chunkNodeId: string
  term: string
  definition: string
}

// MCQs™ — Production AI Integration (ALS-24). Mirrors
// `listDocumentSectionHeadings.ts` exactly, for the one other piece of
// whole-document data MCQs needs to build a real `definition-to-term`
// question: every real, AI-extracted `{term, definition}` pair across
// every chunk, not just the current one — required to pool real
// distractor terms from elsewhere in the document. Computed once,
// server-side, from the same real ULO every mode already loads — never a
// second parse, never a second AI call (UCE-3B already produced every
// definition here, during processing).
export function listDocumentDefinitions(ulo: UniversalLearningObject): readonly DocumentDefinition[] {
  return [...ulo.knowledge.chunks]
    .sort((a, b) => a.location.order - b.location.order)
    .flatMap((chunk) => (chunk.enrichment.definitions ?? []).map((definition) => ({ chunkNodeId: chunk.id, term: definition.term, definition: definition.definition })))
}
