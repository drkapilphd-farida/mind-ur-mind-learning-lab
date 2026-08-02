import type { SessionType, ULOVersion } from '@/core/universal-learning-engine/universal-learning-object'
import type { SessionStatus } from './SessionStatus'
import type { LearningQueue } from './LearningQueue'
import type { SessionPosition } from './SessionPosition'
import type { SessionProgress } from './SessionProgress'
import type { SessionEvent } from './SessionEvent'

// Real versioning envelope — identical pattern to every prior *Version
// type in this arc (ChunkVersion, GraphVersion, AnalysisVersion,
// ULOVersion).
export type SessionVersion = {
  schemaVersion: string
  revision: number
}

// Learning Session™ — the canonical output of LSE-1. Real, per-learner,
// in-memory runtime state, kept fully separate from the immutable ULO
// it runs against ("The Universal Learning Object™ remains immutable.
// Session state is separate from the ULO"). Every session action
// (start/continue/pause/resume/complete/cancel/restart) produces a NEW
// `LearningSession`, never mutates one in place — the same
// "new object per update, versioned" discipline as every prior UCE
// layer.
//
// `sessionType` reuses the ULO's own `SessionType`
// ('reading'|'memory'|'revision'|'research'|'practice') verbatim —
// never a duplicate enum. `uloId`/`uloVersion` give real traceability
// to the exact ULO (and its exact revision) this session was built
// against — a `restartSession()` against a re-aggregated ULO produces a
// genuinely new, distinguishable session generation.
export type LearningSession = {
  id: string
  learnerId: string
  documentId: string
  uloId: string
  uloVersion: ULOVersion
  sessionType: SessionType
  version: SessionVersion
  status: SessionStatus
  queue: LearningQueue
  position: SessionPosition
  progress: SessionProgress
  // Real, append-only audit trail — same pattern as ULOAudit.history/
  // ChunkAudit.history, but event-typed rather than generic-summary-
  // typed, since this arc's own "SESSION EVENTS" requirement calls for
  // real, named event kinds.
  eventLog: readonly SessionEvent[]
  startedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  createdAt: string
  lastModifiedAt: string
}
