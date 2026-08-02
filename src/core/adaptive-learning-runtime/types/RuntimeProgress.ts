// Adaptive Learning Runtime™ (LSE-2). Progress Runtime. Same real
// completion%/time-left model as LSE-1's own `SessionProgress`
// (completed-vs-remaining over a queue, estimated time summed from the
// ULO's own `analysis.chunkAnalyses[].estimatedLearningTimeSeconds`),
// computed here against the runtime's own `scheduledQueue` instead of
// LSE-1's fixed natural-order queue. `skippedCount`/`revisitCount` are
// the genuine value-add over LSE-1's progress model — real counts, not
// full id lists (those already live on `AdaptiveRuntimeState.
// skippedChunkIds`/`revisitChunkIds` — restating them here would be
// duplicate intelligence).
export type RuntimeProgress = {
  completedChunkIds: readonly string[]
  remainingChunkIds: readonly string[]
  completionPercentage: number
  estimatedTimeLeftSeconds: number
  skippedCount: number
  revisitCount: number
}
