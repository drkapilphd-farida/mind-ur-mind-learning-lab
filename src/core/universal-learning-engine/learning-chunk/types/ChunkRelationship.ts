// Learning Chunk™ (canonical domain model). The brief's 13 named
// relationship kinds, exactly as specified — "Parent"/"Children" become
// singular 'parent'/'child' since each ChunkRelationship represents one
// edge to one target chunk; multiple 'child' entries represent multiple
// children collectively.
export type ChunkRelationshipType =
  | 'parent'
  | 'child'
  | 'previous'
  | 'next'
  | 'related'
  | 'depends-on'
  | 'explains'
  | 'references'
  | 'example-of'
  | 'summary-of'
  | 'diagram-for'
  | 'question-for'
  | 'definition-of'

// Who established this edge — 'structural' for the one real, deterministic
// exception this sprint populates (previous/next, pure order-adjacency,
// zero inference); every other kind is reserved for a future engine
// ('semantic' → UCE-3B, 'graph' → UCE-4, 'user' → a future manual-editing
// feature). "These are relationships only. Do NOT compute them" is read
// as *do not compute semantic judgments* — previous/next is an objective
// structural fact, not a judgment.
export type ChunkRelationshipOrigin = 'structural' | 'semantic' | 'graph' | 'user'

export type ChunkRelationship = {
  type: ChunkRelationshipType
  targetChunkId: string
  // Always 1.0 for a 'structural' relationship (no uncertainty in order
  // adjacency); null until a future engine computes a real confidence
  // for a 'semantic'/'graph'/'user' relationship.
  confidence: number | null
  computedBy: ChunkRelationshipOrigin
}

// A chunk's position in a (future) nesting tree — real but flat today,
// since UCE-3A produces a flat sequence of chunks with no nesting. The
// shape exists so a future engine that DOES nest chunks (e.g. chapter →
// section → chunk) doesn't require a breaking change to this model.
export type ChunkHierarchy = {
  depth: number
  path: readonly string[]
  parentChunkId: string | null
}
