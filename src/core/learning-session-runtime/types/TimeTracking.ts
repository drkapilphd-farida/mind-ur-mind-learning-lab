// Learning Session Runtime™ (LSE-3). Real time tracking, derived entirely
// from real `chunk-started`/`chunk-completed`/`chunk-skipped`/
// `runtime-paused`/`runtime-resumed`/`runtime-completed` event timestamps
// already on `AdaptiveRuntimeState.eventLog` — never a second, independently
// running clock. `activeSeconds` is `null` while a chunk is still in
// progress (no real end timestamp exists yet) — an honest gap, not a
// fabricated estimate. `totalPausedSeconds` only sums real, *closed*
// pause→resume intervals — a currently-open pause (paused, not yet resumed)
// is deliberately left uncounted rather than guessed against an assumed
// "now."
export type ChunkTimeRecord = {
  chunkNodeId: string
  startedAt: string
  endedAt: string | null
  activeSeconds: number | null
}

export type TimeTrackingSummary = {
  chunkTimes: readonly ChunkTimeRecord[]
  totalActiveSeconds: number
  totalPausedSeconds: number
  sessionStartedAt: string | null
  sessionEndedAt: string | null
}
