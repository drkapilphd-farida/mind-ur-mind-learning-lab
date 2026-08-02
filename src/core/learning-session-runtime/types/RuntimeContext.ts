import type { SessionType, ULOVersion } from '@/core/universal-learning-engine/universal-learning-object'

// Learning Session Runtime™ (LSE-3). Real, read-only ambient identifiers every
// persistence/metrics/history operation needs — assembled once from a real
// `AdaptiveRuntimeState`, never re-derived per operation. Every field here is
// already a real field on `runtime`/`runtime.session`; this type only gives
// the already-real, scattered set of them one shared name, so LSE-3's own
// functions don't each thread `learnerId`/`uloId`/... independently.
export type RuntimeContext = {
  learnerId: string
  documentId: string
  uloId: string
  uloVersion: ULOVersion
  sessionId: string
  runtimeId: string
  sessionType: SessionType
}
