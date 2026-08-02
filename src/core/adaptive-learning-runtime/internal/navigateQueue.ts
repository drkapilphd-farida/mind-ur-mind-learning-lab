import type { LearningQueue, LearningQueueItem } from '@/core/learning-session-engine'

// Adaptive Learning Runtime™ (LSE-2). Session Navigation. Pure. The
// real, shared position-lookup logic every runtime decision that moves
// through `scheduledQueue` calls — never duplicated per decision.
export function findQueueIndex(queue: LearningQueue, chunkNodeId: string): number {
  return queue.items.findIndex((item) => item.chunkNodeId === chunkNodeId)
}

export function getQueueItemAt(queue: LearningQueue, queueIndex: number): LearningQueueItem | undefined {
  return queue.items[queueIndex]
}

export function getNextQueueItem(queue: LearningQueue, queueIndex: number): LearningQueueItem | undefined {
  return queue.items[queueIndex + 1]
}

export function getPreviousQueueItem(queue: LearningQueue, queueIndex: number): LearningQueueItem | undefined {
  return queueIndex > 0 ? queue.items[queueIndex - 1] : undefined
}
