import type { GraphLearningMetadata } from './GraphLearningMetadata'

export type GraphNodeType = 'chunk' | 'concept'

// One per input LearningChunk — id = chunk.id verbatim, so a caller can
// always join back to the real chunk without a lookup table. Never a
// new/modified chunk; this node only references it.
export type ChunkGraphNode = {
  id: string
  type: 'chunk'
  chunkId: string
  documentId: string
  // Real display label — the chunk's own real heading, or a positional
  // fallback ("Section 3") when the chunk has none — never fabricated
  // prose.
  label: string
  order: number
}

// One per DISTINCT concept, deduplicated across every chunk's real
// concepts/keywords/importantTerms/entities/definitions terms by a
// normalized label — "No duplicated concepts." `id` is a stable,
// deterministic hash of `normalizedLabel` (see internal/
// normalizeConceptLabel.ts, internal/buildConceptIndex.ts) — the same
// concept always resolves to the same id on every rebuild, a disclosed,
// forward-compatible choice for a future cross-document merge (not built
// this sprint).
export type ConceptGraphNode = {
  id: string
  type: 'concept'
  // Real display label — the first real occurrence's original casing/
  // wording, never re-authored.
  label: string
  normalizedLabel: string
  // Real, computed-today: how many distinct chunks mention this concept.
  occurrenceCount: number
  // Real: which chunks mention this concept — a convenience index so a
  // caller doesn't need to walk `part-of` edges to answer "which chunks
  // cover this concept."
  chunkIds: readonly string[]
  // RESERVED Learning Layer extension point — see GraphLearningMetadata.ts.
  // Never populated this sprint.
  learning?: GraphLearningMetadata
}

export type GraphNode = ChunkGraphNode | ConceptGraphNode
