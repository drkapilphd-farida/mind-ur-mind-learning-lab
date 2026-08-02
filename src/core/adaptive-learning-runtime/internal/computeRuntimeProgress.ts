import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningQueue } from '@/core/learning-session-engine'
import type { RuntimeProgress } from '../types/RuntimeProgress'

// Adaptive Learning Runtime™ (LSE-2). Progress Runtime. Pure. The ONE
// shared implementation — every runtime decision that changes
// completed/skipped/revisit state calls this, never re-deriving
// completion%/time-left independently. Mirrors LSE-1's own
// `computeSessionProgress` model exactly (same real
// `estimatedLearningTimeSeconds` reuse, same honest 100%-for-empty-queue
// floor) but computed against the runtime's own `scheduledQueue`
// instead of LSE-1's fixed natural-order queue.
export function computeRuntimeProgress(queue: LearningQueue, completedChunkIds: readonly string[], skippedChunkIds: readonly string[], revisitChunkIds: readonly string[], ulo: UniversalLearningObject): RuntimeProgress {
  const completedSet = new Set(completedChunkIds)
  const allChunkIds = queue.items.map((item) => item.chunkNodeId)
  const remainingChunkIds = allChunkIds.filter((chunkId) => !completedSet.has(chunkId))
  const completionPercentage = allChunkIds.length > 0 ? completedChunkIds.length / allChunkIds.length : 1

  const timeByChunkId = new Map(ulo.analysis.chunkAnalyses.map((chunk) => [chunk.chunkNodeId, chunk.estimatedLearningTimeSeconds]))
  const estimatedTimeLeftSeconds = remainingChunkIds.reduce((sum, chunkId) => sum + (timeByChunkId.get(chunkId) ?? 0), 0)

  return {
    completedChunkIds,
    remainingChunkIds,
    completionPercentage,
    estimatedTimeLeftSeconds,
    skippedCount: skippedChunkIds.length,
    revisitCount: revisitChunkIds.length,
  }
}
