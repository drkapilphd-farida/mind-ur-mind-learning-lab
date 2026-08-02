import type { LearningQueue } from '@/core/learning-session-engine'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { ChunkStrategy } from '../types/ChunkStrategy'
import { applySequentialStrategy } from './strategies/sequentialStrategy'
import { applyPriorityFirstStrategy } from './strategies/priorityFirstStrategy'
import { applyDependencyFirstStrategy } from './strategies/dependencyFirstStrategy'
import { applyReviewFirstStrategy } from './strategies/reviewFirstStrategy'
import { applyAdaptiveQueueStrategy } from './strategies/adaptiveQueueStrategy'

// Adaptive Learning Runtime™ (LSE-2). Chunk Scheduling — the one shared
// dispatcher every runtime decision that (re)computes `scheduledQueue`
// calls, never a hardcoded per-decision switch ("No duplicate runtime
// logic").
export function applyChunkStrategy(strategy: ChunkStrategy, queue: LearningQueue, ulo: UniversalLearningObject, revisitChunkIds: readonly string[], skippedChunkIds: readonly string[]): LearningQueue {
  switch (strategy) {
    case 'sequential':
      return applySequentialStrategy(queue)
    case 'priority-first':
      return applyPriorityFirstStrategy(queue, ulo)
    case 'dependency-first':
      return applyDependencyFirstStrategy(queue, ulo)
    case 'review-first':
      return applyReviewFirstStrategy(queue, ulo)
    case 'adaptive-queue':
      return applyAdaptiveQueueStrategy(queue, ulo, revisitChunkIds, skippedChunkIds)
  }
}
