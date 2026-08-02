import type { ULOVersion, SessionType } from '@/core/universal-learning-engine/universal-learning-object'
import type { SessionStatus } from '@/core/learning-session-engine'
import type { ChunkStrategy } from '@/core/adaptive-learning-runtime'
import type { RuntimeMetrics } from './RuntimeMetrics'

// Learning Session Runtime™ (LSE-3). Session Persistence — the real,
// durable, storage-agnostic shape a `SessionPersistenceAdapter` (reserved,
// see SessionPersistenceAdapter.ts) would write. Deliberately a *derived*
// projection of `AdaptiveRuntimeState`, never a raw copy: every field here
// is either already real state (`completedChunkIds`, `skippedChunkIds`,
// `revisitChunkIds`, `repeatCounts`, `status`) or an already-derived summary
// (`metrics`, `completionPercentage`) — the raw `eventLog` is deliberately
// NOT persisted here. A full historical event-by-event record would grow
// unboundedly with session length and would risk one day being displayed as
// a score/log a learner never agreed to see; this snapshot is the honest,
// bounded, small-and-real alternative every future Learning Mode's own
// persistence (e.g. Quantum Speed Reading™'s `ReadingSessionSummary`) is
// designed to build on top of, not duplicate.
export type SessionSnapshot = {
  runtimeId: string
  sessionId: string
  learnerId: string
  documentId: string
  uloId: string
  uloVersion: ULOVersion
  sessionType: SessionType
  strategy: ChunkStrategy
  // AI Learning Studio™ Sprint ALS-15 — an opaque, mode-defined
  // presentation choice (Memory Mode™'s six real Memory Methods are the
  // first real user of this). Deliberately untyped beyond `string` at
  // this shared layer — LSE-3 has no business knowing Memory Mode's own
  // vocabulary, the same layering QSR's real `chunkStrategy` values
  // already respect one level down. `null` for every mode that never
  // sets it (Quantum Speed Reading™, Smart Notes™ today). Carried forward
  // snapshot-to-snapshot by `applyModeSessionDecision`, exactly how
  // `strategy` already survives every decision via `restoreFromSnapshot`.
  method: string | null
  status: SessionStatus
  completedChunkIds: readonly string[]
  skippedChunkIds: readonly string[]
  revisitChunkIds: readonly string[]
  repeatCounts: Readonly<Record<string, number>>
  completionPercentage: number
  metrics: RuntimeMetrics
  startedAt: string | null
  completedAt: string | null
  capturedAt: string
}
