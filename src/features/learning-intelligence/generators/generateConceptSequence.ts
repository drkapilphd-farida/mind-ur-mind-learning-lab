import type { ConceptGraph, ConceptSequence } from '../types'

// A real breadth-first traversal of the Concept Graph, not the graph's
// own incidental array order — starts from the graph's first concept
// (today's mock ConceptGraphBuilder always produces at least one) and
// walks `relatedConceptIds` outward, so a genuinely tangled future
// graph still produces one deterministic, connected recommended order.
// Any concept the walk never reaches (a disconnected node) is appended
// at the end rather than dropped — every concept is guaranteed to
// appear exactly once.
export function generateConceptSequence(graph: ConceptGraph): ConceptSequence {
  const firstConcept = graph.concepts[0]
  const relatedById = new Map(graph.concepts.map((concept) => [concept.id, concept.relatedConceptIds]))
  const visited = new Set<string>()
  const ordered: string[] = []

  const queue: string[] = firstConcept ? [firstConcept.id] : []
  while (queue.length > 0) {
    const currentId = queue.shift()
    if (currentId === undefined || visited.has(currentId)) continue
    visited.add(currentId)
    ordered.push(currentId)

    for (const relatedId of relatedById.get(currentId) ?? []) {
      if (!visited.has(relatedId)) queue.push(relatedId)
    }
  }

  for (const concept of graph.concepts) {
    if (!visited.has(concept.id)) ordered.push(concept.id)
  }

  return { documentId: graph.documentId, orderedConceptIds: ordered }
}
