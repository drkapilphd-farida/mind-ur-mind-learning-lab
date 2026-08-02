import type { FocusLevel, ReadingStrategy } from '@/core/universal-learning-engine/universal-learning-object'

// Adaptive Learning Runtime™ (LSE-2). Learning State Evaluation. Real,
// pure, per-chunk snapshot — every field is either a real value already
// computed upstream (`focusLevel` from the ULO's own real
// `experience.attentionBlueprint`, `suggestedReadingStrategy`/
// `learningDifficulty` from `analysis.chunkAnalyses`, reused verbatim,
// never re-derived) or a real fact about this runtime's own tracked
// state (`isRepeatedChunk`/`repeatCount` from `repeatCounts`,
// `isMarkedForRevisit` from `revisitChunkIds`, `isCheckpoint` from the
// scheduled queue item). No new AI call, no invented heuristic.
export type LearningStateEvaluation = {
  chunkNodeId: string
  focusLevel: FocusLevel
  suggestedReadingStrategy: ReadingStrategy
  learningDifficulty: number
  isRepeatedChunk: boolean
  repeatCount: number
  isMarkedForRevisit: boolean
  isCheckpoint: boolean
}
