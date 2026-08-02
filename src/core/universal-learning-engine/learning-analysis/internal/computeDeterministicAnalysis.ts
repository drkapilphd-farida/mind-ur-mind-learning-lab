import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { ConceptGraphNode, LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { ChunkAnalysis } from '../types/ChunkAnalysis'
import type { ConceptAnalysis, PracticeStrategy, RevisionStrategy } from '../types/ConceptAnalysis'
import type { LearningMilestone } from '../types/LearningMilestone'
import type { PrerequisiteValidation } from '../types/PrerequisiteValidation'
import { computeChunkMetrics } from './computeChunkMetrics'
import { computeConceptMetrics } from './computeConceptMetrics'
import { computeDependencyChain } from './computeDependencyChain'
import { topologicalSort } from './topologicalSort'

export type ConceptAnalysisBase = Omit<ConceptAnalysis, 'aiRefinedStrategy'>

export type DeterministicAnalysisParts = {
  chunkAnalyses: readonly ChunkAnalysis[]
  conceptAnalysesBase: readonly ConceptAnalysisBase[]
  recommendedLearningOrder: readonly string[]
  prerequisiteValidation: PrerequisiteValidation
  learningMilestones: readonly LearningMilestone[]
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function selectRevisionStrategy(revisionPriority: number): RevisionStrategy {
  return revisionPriority >= 0.66 ? 'intensive-review' : revisionPriority >= 0.33 ? 'spaced-repetition' : 'periodic-review'
}

function selectPracticeStrategy(importance: number): PracticeStrategy {
  return importance >= 0.66 ? 'deliberate-practice' : importance >= 0.33 ? 'guided-practice' : 'light-practice'
}

// AI Learning Analysis Engine™ (UCE-5). Pure, deterministic, zero AI —
// every output except `aiRefinedStrategy` (the one AI-derived piece,
// added separately by buildLearningAnalysis.ts/updateLearningAnalysis.ts,
// never here). The ONE shared implementation both the fresh-build and
// incremental-update entry points call — "No duplicated analysis": there
// is exactly one place these computations happen, not two copies that
// could drift apart.
export function computeDeterministicAnalysis(chunks: readonly LearningChunk[], graph: LearningKnowledgeGraph): DeterministicAnalysisParts {
  const chunkAnalyses: readonly ChunkAnalysis[] = chunks.map((chunk) => ({ chunkNodeId: chunk.id, ...computeChunkMetrics(chunk) }))

  const conceptMetrics = computeConceptMetrics(graph, chunks)
  const { order, unorderedConceptIds } = topologicalSort(graph)
  const orderIndex = new Map(order.map((id, index) => [id, index]))
  const unorderedSet = new Set(unorderedConceptIds)
  const totalOrderable = order.length || 1

  const conceptNodes = graph.nodes.filter((node): node is ConceptGraphNode => node.type === 'concept')

  const conceptAnalysesBase: ConceptAnalysisBase[] = []
  for (const node of conceptNodes) {
    const metrics = conceptMetrics.get(node.id)
    if (!metrics) continue

    const dependencyChain = computeDependencyChain(graph, node.id)
    const recommendedOrder = unorderedSet.has(node.id) ? null : (orderIndex.get(node.id) ?? null)
    const earlyBonus = recommendedOrder !== null ? 1 - recommendedOrder / totalOrderable : 0.5
    const learningPriority = clamp01(0.6 * metrics.importance + 0.4 * earlyBonus)

    conceptAnalysesBase.push({
      conceptNodeId: node.id,
      importance: metrics.importance,
      learningPriority,
      conceptRole: metrics.conceptRole,
      revisionPriority: metrics.revisionPriority,
      recommendedOrder,
      dependencyChain,
      suggestedRevisionStrategy: selectRevisionStrategy(metrics.revisionPriority),
      suggestedPracticeStrategy: selectPracticeStrategy(metrics.importance),
    })
  }

  const prerequisiteValidation: PrerequisiteValidation =
    unorderedConceptIds.length === 0
      ? { valid: true, issues: [] }
      : {
          valid: false,
          issues: [
            {
              type: 'cycle',
              conceptNodeIds: unorderedConceptIds,
              description: `${unorderedConceptIds.length} concept(s) could not be given a valid learning order — each either participates in a real prerequisite cycle or transitively depends on one.`,
            },
          ],
        }

  const conceptLabelById = new Map(conceptNodes.map((node) => [node.id, node.label]))
  const learningMilestones: LearningMilestone[] = conceptAnalysesBase
    .filter((analysis) => analysis.conceptRole === 'core' && analysis.recommendedOrder !== null)
    .sort((a, b) => (a.recommendedOrder ?? 0) - (b.recommendedOrder ?? 0))
    .map((analysis, index) => ({
      order: index,
      conceptNodeId: analysis.conceptNodeId,
      label: conceptLabelById.get(analysis.conceptNodeId) ?? analysis.conceptNodeId,
    }))

  return { chunkAnalyses, conceptAnalysesBase, recommendedLearningOrder: order, prerequisiteValidation, learningMilestones }
}
