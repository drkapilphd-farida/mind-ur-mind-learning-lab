import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningQueue } from '../types/LearningQueue'
import type { SessionProgress } from '../types/SessionProgress'

// Universal Learning Session Engine™ (LSE-1). Pure. The ONE shared
// implementation of the real progress model — every session action that
// changes `completedChunkIds` calls this, never re-deriving completion%/
// time-left independently ("No duplicate session logic"). Reuses the
// ULO's own real `analysis.chunkAnalyses[].estimatedLearningTimeSeconds`
// (UCE-5) verbatim for `estimatedTimeLeftSeconds` — never a new time
// estimate invented here. `completionPercentage` is honestly `1` (100%)
// for a zero-item queue — a real, complete session with nothing left to
// do, not a division-by-zero crash.
export function computeSessionProgress(queue: LearningQueue, completedChunkIds: readonly string[], ulo: UniversalLearningObject): SessionProgress {
  const completedSet = new Set(completedChunkIds)
  const allChunkIds = queue.items.map((item) => item.chunkNodeId)
  const remainingChunkIds = allChunkIds.filter((chunkId) => !completedSet.has(chunkId))
  const completionPercentage = allChunkIds.length > 0 ? completedChunkIds.length / allChunkIds.length : 1

  const timeByChunkId = new Map(ulo.analysis.chunkAnalyses.map((chunk) => [chunk.chunkNodeId, chunk.estimatedLearningTimeSeconds]))
  const estimatedTimeLeftSeconds = remainingChunkIds.reduce((sum, chunkId) => sum + (timeByChunkId.get(chunkId) ?? 0), 0)

  return { completedChunkIds, remainingChunkIds, completionPercentage, estimatedTimeLeftSeconds }
}
