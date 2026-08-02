import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { ChapterIntelligence } from '../types/ChapterIntelligenceBlueprint'
import { conceptNodesForChunk } from './graphHelpers'

// Section 2, "Chapter Intelligence" — pure re-exposure of already-real
// UCE-3B/UCE-5 fields under this Blueprint's own naming. Zero new AI.
export function aggregateChapterIntelligence(chunk: LearningChunk, graph: LearningKnowledgeGraph, analysis: LearningAnalysis): ChapterIntelligence {
  const chunkAnalysis = analysis.chunkAnalyses.find((entry) => entry.chunkNodeId === chunk.id) ?? null

  const conceptNodeIds = new Set(conceptNodesForChunk(graph.nodes, chunk.id).map((node) => node.id))
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]))

  const recommendedLearningOrder = analysis.recommendedLearningOrder
    .filter((nodeId) => conceptNodeIds.has(nodeId))
    .map((nodeId) => nodeById.get(nodeId))
    .filter((node): node is NonNullable<typeof node> => node !== undefined)
    .map((node) => node.label)

  return {
    summary: chunk.enrichment.semantic ?? null,
    learningObjectives: chunk.enrichment.learningObjectives ?? [],
    coreConcepts: chunk.enrichment.concepts ?? [],
    prerequisiteConcepts: chunk.enrichment.prerequisites ?? [],
    readingDifficulty: chunkAnalysis?.readingComplexity ?? null,
    recommendedLearningOrder,
  }
}
