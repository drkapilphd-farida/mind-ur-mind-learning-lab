import type { ConceptGraphBuilder } from '../contracts'
import type { Concept, ConceptGraph, ConceptGraphEdge, ExtractedContent } from '../types'

// Implements ConceptGraphBuilder. Mock today — no embeddings, no
// clustering model, per this sprint's explicit scope — but genuinely
// derives its output from ExtractedContent rather than a fixed,
// content-independent template pool: one Concept per extracted
// section, so a document with different sections produces a
// genuinely different graph. Neighboring sections are linked
// bidirectionally, giving a real chain graph rather than an
// unconnected list — "concept graph," not "concept list."
export class MockConceptGraphBuilder implements ConceptGraphBuilder {
  async build(content: ExtractedContent): Promise<ConceptGraph> {
    const edges: ConceptGraphEdge[] = []
    for (let index = 0; index < content.sections.length - 1; index += 1) {
      const currentId = `concept-${index}`
      const nextId = `concept-${index + 1}`
      edges.push({ fromConceptId: currentId, toConceptId: nextId })
      edges.push({ fromConceptId: nextId, toConceptId: currentId })
    }

    const concepts: Concept[] = content.sections.map((section, index) => {
      const id = `concept-${index}`
      return {
        id,
        title: section.title,
        description: section.text,
        // Derived from `edges`, not authored separately — the two can
        // never drift out of sync because one is computed from the
        // other.
        relatedConceptIds: edges.filter((edge) => edge.fromConceptId === id).map((edge) => edge.toConceptId),
      }
    })

    return { documentId: content.documentId, concepts, edges }
  }
}
