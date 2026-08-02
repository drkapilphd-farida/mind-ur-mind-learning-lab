import type { SmartNotesSessionAnalytics } from './types/SmartNotesSessionAnalytics'
import type { SmartNotesSessionComparison } from './types/SmartNotesSessionComparison'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Session Comparison.
// Pure — a real, honest delta between two real sessions' own
// already-computed analytics. Mirrors Memory Mode™'s own
// `compareMemorySessions` (Sprint-4) exactly.
export function compareSmartNotesSessions(current: SmartNotesSessionAnalytics, previous: SmartNotesSessionAnalytics): SmartNotesSessionComparison {
  return {
    currentSessionId: current.sessionId,
    previousSessionId: previous.sessionId,
    engagementScoreDelta: current.engagementScore - previous.engagementScore,
    completionRateDelta: current.tracking.completionRate - previous.tracking.completionRate,
    revisitRateDelta: current.tracking.revisitRate - previous.tracking.revisitRate,
  }
}
