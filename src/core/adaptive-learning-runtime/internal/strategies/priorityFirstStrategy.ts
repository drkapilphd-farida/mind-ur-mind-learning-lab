import type { LearningQueue, LearningQueueItem } from '@/core/learning-session-engine'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

// Adaptive Learning Runtime™ (LSE-2). Chunk Scheduling — Priority First.
// Real: sorts by each chunk's own real `enrichment.importance` (UCE-3B,
// 0-1) descending — never a new importance signal invented here. A
// chunk with no real `importance` yet (enrichment not populated) sorts
// as `0`, the honest default: unranked, not fabricated as "most
// important." Ties keep real natural document order (`item.order`) — a
// stable sort.
export function applyPriorityFirstStrategy(queue: LearningQueue, ulo: UniversalLearningObject): LearningQueue {
  const importanceByChunkId = new Map(ulo.knowledge.chunks.map((chunk) => [chunk.id, chunk.enrichment.importance ?? 0]))

  const items: LearningQueueItem[] = [...queue.items].sort((a, b) => {
    const importanceDelta = (importanceByChunkId.get(b.chunkNodeId) ?? 0) - (importanceByChunkId.get(a.chunkNodeId) ?? 0)
    return importanceDelta !== 0 ? importanceDelta : a.order - b.order
  })

  return { items }
}
