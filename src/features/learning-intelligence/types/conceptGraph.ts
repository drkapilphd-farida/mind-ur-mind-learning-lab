import type { Concept } from './concept'

// Pipeline stage 2 output: ExtractedContent → ConceptGraph. `edges` is
// the graph's actual connective structure; `Concept.relatedConceptIds`
// (stage output, denormalized) and `edges` (this graph's own record)
// describe the same relationships — kept as two views because
// consumers differ: a MindMapNode transformer wants a traversable edge
// list, while a generator producing per-concept content just wants
// `concept.relatedConceptIds` inline.
export type ConceptGraphEdge = {
  fromConceptId: string
  toConceptId: string
}

export type ConceptGraph = {
  documentId: string
  concepts: readonly Concept[]
  edges: readonly ConceptGraphEdge[]
}
