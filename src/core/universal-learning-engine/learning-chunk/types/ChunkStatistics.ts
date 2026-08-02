// Learning Chunk™ (canonical domain model). Real, computed-today
// structural counts — distinct from ChunkReadingMetrics (below), which
// is specifically about time-to-read, not raw counts.
export type ChunkStatistics = {
  wordCount: number
  characterCount: number
  blockCount: number
  paragraphCount: number
  tableCount: number
  mediaCount: number
}

// Real reading-time estimate, reusing the exact same 200 WPM assumption
// already established elsewhere in this arc (computeReadability.ts,
// generateReadingPassage.ts) — one shared constant, never a second one
// invented for this model.
export type ChunkReadingMetrics = {
  estimatedReadingSeconds: number
}
