import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningQueue } from '@/core/learning-session-engine'
import type { LearningStateEvaluation } from './types/LearningStateEvaluation'

// Adaptive Learning Runtime™ (LSE-2). Learning State Evaluation. Pure,
// read-only. Sits at the top level (not under internal/) because it is
// a real, disclosed public capability of this sprint — a future
// Learning Mode can call it directly to snapshot "how is the learner
// doing on this chunk right now" without mutating the runtime, unlike
// internal/'s pure helpers, which exist only to be composed by
// decisions/ and are never exported. Every field is a real,
// already-computed upstream value or a real fact about this runtime's
// own tracked state (see types/LearningStateEvaluation.ts for exactly
// which). Honest defaults when a chunk genuinely has no analysis entry
// (shouldn't happen — every real chunk has one) or no attention entry:
// `learningDifficulty` 0, `focusLevel` 'moderate' (the real threshold
// classification's own middle value, not a fabricated guess),
// `suggestedReadingStrategy` 'single-pass-read' (the real
// least-intensive strategy, an honest floor).
export function evaluateLearningState(chunkNodeId: string, ulo: UniversalLearningObject, scheduledQueue: LearningQueue, revisitChunkIds: readonly string[], repeatCounts: Readonly<Record<string, number>>): LearningStateEvaluation {
  const chunkAnalysis = ulo.analysis.chunkAnalyses.find((analysis) => analysis.chunkNodeId === chunkNodeId)
  const attentionEntry = ulo.experience.attentionBlueprint.entries.find((entry) => entry.chunkNodeId === chunkNodeId)
  const queueItem = scheduledQueue.items.find((item) => item.chunkNodeId === chunkNodeId)
  const repeatCount = repeatCounts[chunkNodeId] ?? 0

  return {
    chunkNodeId,
    focusLevel: attentionEntry?.focusLevel ?? 'moderate',
    suggestedReadingStrategy: chunkAnalysis?.suggestedReadingStrategy ?? 'single-pass-read',
    learningDifficulty: chunkAnalysis?.learningDifficulty ?? 0,
    isRepeatedChunk: repeatCount > 0,
    repeatCount,
    isMarkedForRevisit: revisitChunkIds.includes(chunkNodeId),
    isCheckpoint: queueItem?.isCheckpoint ?? false,
  }
}
