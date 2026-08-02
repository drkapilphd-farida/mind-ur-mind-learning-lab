// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Session
// Comparison — a real, honest delta between two real sessions' own
// already-computed analytics. Positive deltas mean the current session
// measured higher than the previous one; never a score, just a real
// difference.
export type MemorySessionComparison = {
  currentSessionId: string
  previousSessionId: string
  confidenceScoreDelta: number
  completionRateDelta: number
  revisitRateDelta: number
}
