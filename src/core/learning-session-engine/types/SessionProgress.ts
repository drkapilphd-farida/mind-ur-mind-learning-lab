// Universal Learning Session Engine™ (LSE-1). Real, computed by the one
// shared internal/computeSessionProgress.ts — never duplicated per
// action. `estimatedTimeLeftSeconds` sums the ULO's own real
// `analysis.chunkAnalyses[].estimatedLearningTimeSeconds` (UCE-5) over
// `remainingChunkIds` — reused verbatim, never re-derived.
export type SessionProgress = {
  completedChunkIds: readonly string[]
  remainingChunkIds: readonly string[]
  completionPercentage: number
  estimatedTimeLeftSeconds: number
}
