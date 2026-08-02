// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Real-time
// tracking signals for a single session, derived entirely from that
// session's own already-real, already-persisted `SessionSnapshot`
// (LSE-3) — no new persistence, no new event log. `revisitRate`/
// `repeatRate` reuse LSE-3's own mode-agnostic `RuntimeMetrics` fields
// directly; nothing here is a duplicate of any existing analytics
// concept.
export type MemorySessionTracking = {
  sessionId: string
  completionRate: number
  revisitRate: number
  repeatRate: number
  pauseCount: number
  elapsedSeconds: number
}
