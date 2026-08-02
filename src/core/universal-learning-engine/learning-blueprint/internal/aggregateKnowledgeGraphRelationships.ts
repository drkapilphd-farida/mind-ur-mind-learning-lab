import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { KnowledgeGraphRelationships } from '../types/ChapterIntelligenceBlueprint'
import { conceptNodesForChunk, isConceptNode } from './graphHelpers'

// Section 7 — a direct filter/reshape of the already-real
// `LearningKnowledgeGraph` (UCE-4). "Store relationships only. No
// visualization." Zero new AI, zero new computation. Scoped to any edge
// where at least one endpoint is a concept this chapter introduces —
// the other endpoint may legitimately belong to a different chapter
// (e.g. a real `builds-upon` edge to a concept introduced earlier in the
// document), which is real, useful information, not scope creep.
export function aggregateKnowledgeGraphRelationships(chunkId: string, graph: LearningKnowledgeGraph): KnowledgeGraphRelationships {
  const chapterConceptNodeIds = new Set(conceptNodesForChunk(graph.nodes, chunkId).map((node) => node.id))
  const allConceptNodeIds = new Set(graph.nodes.filter(isConceptNode).map((node) => node.id))

  const relationships = graph.edges
    .filter((edge) => allConceptNodeIds.has(edge.sourceNodeId) && allConceptNodeIds.has(edge.targetNodeId))
    .filter((edge) => chapterConceptNodeIds.has(edge.sourceNodeId) || chapterConceptNodeIds.has(edge.targetNodeId))
    .map((edge) => ({ type: edge.type, sourceObjectId: edge.sourceNodeId, targetObjectId: edge.targetNodeId }))

  return { relationships }
}
