// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Learning
// Consistency Metrics — real calendar-day bucketing over real session
// `capturedAt` timestamps (UTC, to stay deterministic regardless of the
// server's local timezone). No new tracking table — every input is a
// real, already-persisted `SessionSnapshot`.
export type MemoryConsistencyMetrics = {
  activeDays: number
  currentStreakDays: number
  longestStreakDays: number
  averageSessionsPerActiveDay: number
}
