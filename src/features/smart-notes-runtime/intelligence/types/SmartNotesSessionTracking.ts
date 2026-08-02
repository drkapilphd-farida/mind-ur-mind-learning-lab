// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Real-time tracking
// signals for a single session, derived entirely from that session's own
// already-real, already-persisted `SessionSnapshot` (LSE-3) — no new
// persistence, no new event log, no reading of note *content*. Mirrors
// Memory Mode™'s own `MemorySessionTracking` (Sprint-3) exactly — these
// signals are mode-agnostic `RuntimeMetrics` derivations, not a
// redesign, just the same real pattern applied to a different mode.
export type SmartNotesSessionTracking = {
  sessionId: string
  completionRate: number
  revisitRate: number
  repeatRate: number
  pauseCount: number
  elapsedSeconds: number
}
