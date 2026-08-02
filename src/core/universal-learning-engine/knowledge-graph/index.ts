// Universal Learning Intelligence Engine™ (ULIE™) — Learning Knowledge
// Graph Engine™ (UCE-4). The one import path every downstream engine
// (UCE-5 onward) uses — never import from types/internal directly.

export { buildLearningKnowledgeGraph } from './buildLearningKnowledgeGraph'
export { updateLearningKnowledgeGraph } from './updateLearningKnowledgeGraph'
export { createGraphIndex } from './internal/graphIndex'
export type { GraphIndex, TraversalDirection } from './internal/graphIndex'

export type {
  GraphNodeType,
  ChunkGraphNode,
  ConceptGraphNode,
  GraphNode,
  GraphEdgeType,
  GraphEdgeDirection,
  GraphEdgeOrigin,
  GraphEdge,
  GraphVersion,
  LearningKnowledgeGraph,
  ConceptRole,
  GraphLearningMetadata,
  GraphAssessmentSignals,
  GraphBuildOptions,
} from './types'
