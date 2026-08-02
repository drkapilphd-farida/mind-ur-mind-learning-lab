// Smart Notes™ Sprint-4 — Analytics & Insights™. Learning Consistency
// Metrics — real calendar-day bucketing over real session `capturedAt`
// timestamps (UTC, to stay deterministic regardless of the server's
// local timezone). No new tracking table — every input is a real,
// already-persisted `SessionSnapshot`. Mirrors Memory Mode™'s own
// `MemoryConsistencyMetrics` (Sprint-4) exactly.
export type SmartNotesConsistencyMetrics = {
  activeDays: number
  currentStreakDays: number
  longestStreakDays: number
  averageSessionsPerActiveDay: number
}
