import type { LearningQueue, LearningQueueItem } from '@/core/learning-session-engine'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

// Adaptive Learning Runtime™ (LSE-2). Chunk Scheduling — Review First.
// Real: reuses the ULO's own real `learning.memoryBlueprint` (UCE-6 —
// `analysis.chunkAnalyses` already sorted by real `memoryDifficulty`
// descending, "the chunks hardest to retain first") for the sort key —
// never a second, independently-computed memory-difficulty score. A
// chunk absent from the blueprint (shouldn't happen — every chunk has a
// real `ChunkAnalysis`) sorts as `0`, the honest default. Ties fall
// back to real natural document order.
export function applyReviewFirstStrategy(queue: LearningQueue, ulo: UniversalLearningObject): LearningQueue {
  const memoryDifficultyByChunkId = new Map(ulo.learning.memoryBlueprint.entries.map((entry) => [entry.chunkNodeId, entry.memoryDifficulty]))

  const items: LearningQueueItem[] = [...queue.items].sort((a, b) => {
    const difficultyDelta = (memoryDifficultyByChunkId.get(b.chunkNodeId) ?? 0) - (memoryDifficultyByChunkId.get(a.chunkNodeId) ?? 0)
    return difficultyDelta !== 0 ? difficultyDelta : a.order - b.order
  })

  return { items }
}
