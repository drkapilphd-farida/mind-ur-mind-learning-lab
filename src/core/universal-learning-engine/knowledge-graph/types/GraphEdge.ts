// Learning Knowledge Graph™ (UCE-4) — the brief's 14 named relationship
// kinds, exactly as specified. A NEW, graph-level vocabulary — distinct
// from (and not an extension of) the Learning Chunk sprint's
// chunk-level, mostly-structural `ChunkRelationshipType`. Which of these
// 14 actually get real edges this sprint — and why the rest stay
// type-only/reserved — is documented in internal/buildStructuralEdges.ts
// and docs/PRODUCTION_HANDOFF_UCE_4.md.
export type GraphEdgeType =
  | 'prerequisite'
  | 'depends-on'
  | 'explains'
  | 'defines'
  | 'introduces'
  | 'builds-upon'
  | 'related-to'
  | 'example-of'
  | 'part-of'
  | 'summary-of'
  | 'diagram-for'
  | 'formula-for'
  | 'question-for'
  | 'revision-of'

// Most edge types are directed (source -> target has real, distinct
// meaning from target -> source). `related-to` is the one undirected
// type this sprint produces — co-occurrence has no real inherent
// direction.
export type GraphEdgeDirection = 'directed' | 'undirected'

// Who established this edge — 'structural' for every deterministic,
// zero-AI derivation this sprint (part-of, introduces, defines,
// prerequisite, depends-on, related-to, example-of, diagram-for — all
// real facts resolved from UCE-3B's already-real enrichment data, no new
// judgment made); 'semantic' for the one edge type this sprint derives
// via a real AIFoundation.execute() call (builds-upon).
export type GraphEdgeOrigin = 'structural' | 'semantic'

export type GraphEdge = {
  // Deterministic — see internal/computeEdgeId.ts. Enforces "No
  // duplicated relationships": the same (type, sourceNodeId,
  // targetNodeId) triple (order-normalized for undirected edges) always
  // produces the same id, so re-deriving the same edge strengthens it
  // (see `weight`) rather than creating a duplicate.
  id: string
  type: GraphEdgeType
  sourceNodeId: string
  targetNodeId: string
  direction: GraphEdgeDirection
  // Real signal strength — 1.0 for a definitive structural fact (defines,
  // introduces); real co-occurrence count for related-to (repeated
  // co-occurrence increases this, never creates a second edge); 1.0 for
  // resolved prerequisite/depends-on/part-of/example-of/diagram-for
  // (presented as one full edge each).
  weight: number
  // Real epistemic certainty, distinct from `weight`. 1.0 for a
  // definitive structural fact; a genuinely lower, disclosed value
  // (0.5) for a coarse heuristic (example-of, diagram-for — presence-
  // based, not verified to be specifically about the linked concept);
  // the source chunk's own real `confidence.semantic` (UCE-3B's
  // self-reported AI confidence) for prerequisite/depends-on, passed
  // through rather than fabricated; the model's own self-reported
  // confidence for builds-upon; `null` when no real confidence signal
  // exists.
  confidence: number | null
  computedBy: GraphEdgeOrigin
  createdAt: string
}
