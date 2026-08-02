import type { LearningQueue, LearningQueueItem } from '@/core/learning-session-engine'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

// Adaptive Learning Runtime™ (LSE-2). Chunk Scheduling — Dependency
// First. Real: orders chunks by the real topological position
// (`ConceptAnalysis.recommendedOrder`, UCE-5's own prerequisite/
// depends-on/builds-upon topological sort) of the concept each chunk
// introduces (`LearningQueueItem.checkpointConceptNodeId`, resolved by
// LSE-1's own `buildLearningQueue` from the real `'introduces'` graph
// edge) — never a second, independently-derived dependency order. A
// chunk that introduces no concept, or whose concept sits in a real
// detected cycle (`recommendedOrder === null`), sorts after every
// resolvable chunk, in real natural document order among themselves —
// an honest "no dependency signal" placement, not a fabricated position.
export function applyDependencyFirstStrategy(queue: LearningQueue, ulo: UniversalLearningObject): LearningQueue {
  const orderByConceptId = new Map(ulo.analysis.conceptAnalyses.map((concept) => [concept.conceptNodeId, concept.recommendedOrder]))

  const rank = (item: LearningQueueItem): number => {
    const conceptOrder = item.checkpointConceptNodeId ? orderByConceptId.get(item.checkpointConceptNodeId) : undefined
    return conceptOrder ?? Number.POSITIVE_INFINITY
  }

  const items: LearningQueueItem[] = [...queue.items].sort((a, b) => {
    const rankDelta = rank(a) - rank(b)
    return rankDelta !== 0 ? rankDelta : a.order - b.order
  })

  return { items }
}
