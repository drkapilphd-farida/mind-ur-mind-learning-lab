// Learning Session Runtime™ (LSE-3) — the one public import path. Consumes
// ONLY the Universal Learning Object™, the Learning Session Engine's own
// public barrel, and the Adaptive Learning Runtime's own public barrel;
// never a lower engine, never another layer's internal/. Adds exactly the
// six capabilities genuinely missing from LSE-1/LSE-2 — Runtime Context,
// Runtime Metrics, Time Tracking, Error Recovery, Session Persistence, and
// Session History — never re-implementing LearningSession, the session
// state machine, session lifecycle, progress tracking, checkpoints, or
// runtime events, all of which LSE-1/LSE-2 already provide and remain the
// sole source of.
export type {
  RuntimeContext,
  RuntimeMetrics,
  ChunkTimeRecord,
  TimeTrackingSummary,
  RuntimeHealthIssueCode,
  RuntimeHealthIssue,
  RuntimeHealthCheck,
  SessionSnapshot,
  SessionHistoryEntry,
  SessionHistory,
  SessionPersistenceAdapter,
} from './types'

export { deriveRuntimeContext } from './deriveRuntimeContext'
export { computeRuntimeMetrics } from './computeRuntimeMetrics'
export { computeTimeTracking } from './computeTimeTracking'
export { diagnoseRuntimeHealth } from './diagnoseRuntimeHealth'
export { buildSessionSnapshot } from './buildSessionSnapshot'
export { buildSessionHistory } from './buildSessionHistory'

export { restoreFromSnapshot } from './recovery/restoreFromSnapshot'
export { recoverRuntime } from './recovery/recoverRuntime'
