// Learning Session Runtime™ (LSE-3). Real, mode-agnostic metrics — every
// field is computed from data LSE-2's own `AdaptiveRuntimeState` already
// carries (`progress`, `eventLog`, `repeatCounts`, `skippedChunkIds`,
// `revisitChunkIds`) and reused, never re-derived from a duplicate signal.
// Deliberately generic: no reading-specific concept (WPM, exposure duration,
// ...) belongs here — that is each Learning Mode's own concern, layered on
// top of this runtime, never pushed down into it.
export type RuntimeMetrics = {
  totalChunks: number
  completedChunks: number
  skippedChunks: number
  revisitedChunks: number
  totalRepeats: number
  pauseCount: number
  checkpointCount: number
}
