// Pipeline support artifact, Chunk 3: an ordering on top of the Concept
// Graph (Chunk 2) — the graph itself is unordered (a web of edges);
// this is the one recommended path through it, computed by
// generateConceptSequence() via a real traversal, not just the graph's
// own incidental array order.
export type ConceptSequence = {
  documentId: string
  orderedConceptIds: readonly string[]
}
