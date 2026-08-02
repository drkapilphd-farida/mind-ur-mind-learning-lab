import type { MemorySessionAnalytics } from './types/MemorySessionAnalytics'
import type { MemorySessionComparison } from './types/MemorySessionComparison'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Session
// Comparison (item 6). Pure — a real, honest delta between two real
// sessions' own already-computed analytics. Positive deltas mean
// `current` measured higher than `previous`.
export function compareMemorySessions(current: MemorySessionAnalytics, previous: MemorySessionAnalytics): MemorySessionComparison {
  return {
    currentSessionId: current.sessionId,
    previousSessionId: previous.sessionId,
    confidenceScoreDelta: current.confidenceScore - previous.confidenceScore,
    completionRateDelta: current.tracking.completionRate - previous.tracking.completionRate,
    revisitRateDelta: current.tracking.revisitRate - previous.tracking.revisitRate,
  }
}
