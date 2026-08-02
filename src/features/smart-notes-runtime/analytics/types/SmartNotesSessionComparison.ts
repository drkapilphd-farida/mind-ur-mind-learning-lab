// Smart Notes™ Sprint-4 — Analytics & Insights™. Session Comparison — a
// real, honest delta between two real sessions' own already-computed
// analytics. Positive deltas mean the current session measured higher
// than the previous one; never a score, just a real difference. Mirrors
// Memory Mode™'s own `MemorySessionComparison` (Sprint-4) exactly.
export type SmartNotesSessionComparison = {
  currentSessionId: string
  previousSessionId: string
  engagementScoreDelta: number
  completionRateDelta: number
  revisitRateDelta: number
}
