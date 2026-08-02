import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { RecommendationIntelligence } from '../types/ChapterIntelligenceBlueprint'
import { conceptNodesForChunk } from './graphHelpers'

// Section 9 — a direct reshape of already-real UCE-5 fields
// (`ConceptAnalysis.importance`/`.revisionPriority`,
// `LearningAnalysis.recommendedLearningOrder`), scoped to this chapter's
// own concepts. Zero new AI, zero new difficulty/order computation.
export function aggregateRecommendationIntelligence(
  chunk: LearningChunk,
  allChunks: readonly LearningChunk[],
  graph: LearningKnowledgeGraph,
  analysis: LearningAnalysis,
): RecommendationIntelligence {
  const chunkById = new Map(allChunks.map((entry) => [entry.id, entry]))
  const conceptAnalysisByNodeId = new Map(analysis.conceptAnalyses.map((entry) => [entry.conceptNodeId, entry]))
  const chapterConceptNodes = conceptNodesForChunk(graph.nodes, chunk.id)

  const scored = chapterConceptNodes
    .map((node) => ({ node, analysis: conceptAnalysisByNodeId.get(node.id) }))
    .filter((entry): entry is { node: (typeof chapterConceptNodes)[number]; analysis: NonNullable<(typeof entry)['analysis']> } => entry.analysis !== undefined)

  // "Difficult" — the only real difficulty signal available at concept
  // granularity: any chunk that introduces this concept was itself
  // categorically marked 'advanced' by UCE-3B's real enrichment.
  const difficultConcepts = scored
    .filter(({ node }) => node.chunkIds.map((id) => chunkById.get(id)?.enrichment.difficulty).some((difficulty) => difficulty === 'advanced'))
    .map(({ node }) => node.label)

  const suggestedReadingOrder = [...scored].sort((a, b) => (a.analysis.recommendedOrder ?? Number.POSITIVE_INFINITY) - (b.analysis.recommendedOrder ?? Number.POSITIVE_INFINITY)).map(({ node }) => node.label)

  const revisionPriority = [...scored].sort((a, b) => b.analysis.revisionPriority - a.analysis.revisionPriority).map(({ node }) => node.label)

  return { difficultConcepts, suggestedReadingOrder, revisionPriority }
}
