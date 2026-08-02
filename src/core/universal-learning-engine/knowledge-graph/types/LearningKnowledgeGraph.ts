import type { GraphNode } from './GraphNode'
import type { GraphEdge } from './GraphEdge'

// Real versioning envelope — identical pattern to LearningChunk's
// ChunkVersion. `schemaVersion` is the shape version of
// LearningKnowledgeGraph itself; `revision` is this specific graph's
// real edit count — 1 at first build, incremented only by a real
// updateLearningKnowledgeGraph() call.
export type GraphVersion = {
  schemaVersion: string
  revision: number
}

// Learning Knowledge Graph™ — the canonical output of UCE-4. A fully
// separate, additive artifact: it references the source document and
// chunks by id, but never modifies them (see docs/
// PRODUCTION_HANDOFF_UCE_4.md's "Never Modify" section). `nodeCount`/
// `edgeCount` are real, computed once at assembly time — the one place
// they're computed, so no future consumer re-derives them differently
// (same pattern as UCE-3A's ChunkedLearningDocument.chunkCount).
export type LearningKnowledgeGraph = {
  id: string
  documentId: string
  version: GraphVersion
  nodes: readonly GraphNode[]
  edges: readonly GraphEdge[]
  nodeCount: number
  edgeCount: number
  createdAt: string
  lastModifiedAt: string
}
