import type { LearningQueue, LearningQueueItem } from '@/core/learning-session-engine'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

// Adaptive Learning Runtime™ (LSE-2). Chunk Scheduling — Adaptive
// Queue. The one strategy that is genuinely per-learner/per-runtime
// rather than a static re-sort of ULO data alone: chunks the learner
// explicitly marked `revisit-later` (real runtime state,
// `AdaptiveRuntimeState.revisitChunkIds`) are pulled to the front;
// chunks the learner explicitly `skip`ped (real runtime state,
// `skippedChunkIds`) sink to the back; everything else is ordered by
// real `enrichment.importance` descending (reused, never re-derived),
// falling back to real natural document order on a tie. This is the
// strategy `continueRuntime`
// re-applies on every advance so newly marked revisit/skip chunks are
// reflected immediately — see decisions/continueRuntime.ts.
export function applyAdaptiveQueueStrategy(queue: LearningQueue, ulo: UniversalLearningObject, revisitChunkIds: readonly string[], skippedChunkIds: readonly string[]): LearningQueue {
  const revisitSet = new Set(revisitChunkIds)
  const skippedSet = new Set(skippedChunkIds)
  const importanceByChunkId = new Map(ulo.knowledge.chunks.map((chunk) => [chunk.id, chunk.enrichment.importance ?? 0]))

  const group = (item: LearningQueueItem): number => {
    if (revisitSet.has(item.chunkNodeId)) return 0
    if (skippedSet.has(item.chunkNodeId)) return 2
    return 1
  }

  const items: LearningQueueItem[] = [...queue.items].sort((a, b) => {
    const groupDelta = group(a) - group(b)
    if (groupDelta !== 0) return groupDelta
    const importanceDelta = (importanceByChunkId.get(b.chunkNodeId) ?? 0) - (importanceByChunkId.get(a.chunkNodeId) ?? 0)
    return importanceDelta !== 0 ? importanceDelta : a.order - b.order
  })

  return { items }
}
