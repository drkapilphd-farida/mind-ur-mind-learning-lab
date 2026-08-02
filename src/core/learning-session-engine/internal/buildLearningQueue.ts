import type { LearningKnowledgeGraph, UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningQueue, LearningQueueItem } from '../types/LearningQueue'

// Real: the only place a chunk is treated as "introducing" a concept —
// resolved from the ULO's own real `'introduces'` GraphEdge, never
// guessed from ordering.
function findIntroducingChunkId(graph: LearningKnowledgeGraph, conceptNodeId: string): string | undefined {
  return graph.edges.find((edge) => edge.type === 'introduces' && edge.targetNodeId === conceptNodeId)?.sourceNodeId
}

// Universal Learning Session Engine™ (LSE-1). Pure. Builds the real
// learning queue a session runs through — every real chunk in
// `ulo.knowledge.chunks`, ordered by real `location.order` (the
// document's own natural reading order — this engine never reorders
// content by `analysis.recommendedLearningOrder`, which is concept-
// level, not chunk-level). Checkpoints are real: reuses UCE-6's own
// `experience.learningJourney.steps` resolved onto their real
// introducing chunk — never a second, independently-derived notion of
// "milestone."
export function buildLearningQueue(ulo: UniversalLearningObject): LearningQueue {
  const chunksByOrder = [...ulo.knowledge.chunks].sort((a, b) => a.location.order - b.location.order)

  const checkpointByChunkId = new Map<string, { conceptNodeId: string; label: string }>()
  for (const step of ulo.experience.learningJourney.steps) {
    const introducingChunkId = findIntroducingChunkId(ulo.knowledge.graph, step.conceptNodeId)
    if (introducingChunkId) checkpointByChunkId.set(introducingChunkId, { conceptNodeId: step.conceptNodeId, label: step.label })
  }

  const items: LearningQueueItem[] = chunksByOrder.map((chunk) => {
    const checkpoint = checkpointByChunkId.get(chunk.id)
    return {
      chunkNodeId: chunk.id,
      order: chunk.location.order,
      isCheckpoint: checkpoint !== undefined,
      ...(checkpoint ? { checkpointConceptNodeId: checkpoint.conceptNodeId, checkpointLabel: checkpoint.label } : {}),
    }
  })

  return { items }
}
