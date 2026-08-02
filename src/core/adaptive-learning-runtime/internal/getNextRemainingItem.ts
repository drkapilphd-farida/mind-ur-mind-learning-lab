import type { LearningQueue, LearningQueueItem } from '@/core/learning-session-engine'

// Adaptive Learning Runtime™ (LSE-2). Session Navigation. Pure. The
// real, shared "what's next" lookup — the first scheduled item that is
// neither completed nor skipped — every decision that advances the
// runtime (`continueRuntime`, `skipChunk`) calls this, never
// duplicating its own filter.
export function getNextRemainingItem(queue: LearningQueue, completedChunkIds: readonly string[], skippedChunkIds: readonly string[]): LearningQueueItem | undefined {
  const completedSet = new Set(completedChunkIds)
  const skippedSet = new Set(skippedChunkIds)
  return queue.items.find((item) => !completedSet.has(item.chunkNodeId) && !skippedSet.has(item.chunkNodeId))
}
