import type { LearningQueue } from '@/core/learning-session-engine'

// Adaptive Learning Runtime™ (LSE-2). Chunk Scheduling — Sequential
// strategy. Real identity: LSE-1's own queue is already real
// natural-document-order (`location.order`) — this strategy schedules
// nothing new, it IS that order. Returns a new array (never the same
// reference) so `scheduledQueue` stays genuinely independent of
// `session.queue` for every strategy, never a shared-mutable reference.
export function applySequentialStrategy(queue: LearningQueue): LearningQueue {
  return { items: [...queue.items] }
}
