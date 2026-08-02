import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningJourney } from '../types/ExperienceIntelligence'

// Universal Learning Object™ (UCE-6). Pure. Real re-shape of UCE-5's own
// `learningMilestones`, with a real per-step time estimate: the sum of
// `estimatedLearningTimeSeconds` (UCE-5, real) across every real chunk
// that covers the milestone's concept (`ConceptGraphNode.chunkIds`,
// UCE-4, real) — needs both `analysis` and `graph` since the time data
// and the concept-to-chunk mapping live in two different real layers.
export function buildLearningJourney(analysis: LearningAnalysis, graph: LearningKnowledgeGraph): LearningJourney {
  const timeByChunkId = new Map(analysis.chunkAnalyses.map((chunk) => [chunk.chunkNodeId, chunk.estimatedLearningTimeSeconds]))
  const conceptNodeById = new Map(graph.nodes.filter((node) => node.type === 'concept').map((node) => [node.id, node]))

  const steps = analysis.learningMilestones.map((milestone) => {
    const conceptNode = conceptNodeById.get(milestone.conceptNodeId)
    const chunkIds = conceptNode?.type === 'concept' ? conceptNode.chunkIds : []
    const estimatedTimeSeconds = chunkIds.reduce((sum, chunkId) => sum + (timeByChunkId.get(chunkId) ?? 0), 0)

    return { order: milestone.order, conceptNodeId: milestone.conceptNodeId, label: milestone.label, estimatedTimeSeconds }
  })

  const totalEstimatedTimeSeconds = steps.reduce((sum, step) => sum + step.estimatedTimeSeconds, 0)

  return { steps, totalEstimatedTimeSeconds }
}
