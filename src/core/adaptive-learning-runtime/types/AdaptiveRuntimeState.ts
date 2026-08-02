import type { LearningQueue, LearningSession, SessionPosition } from '@/core/learning-session-engine'
import type { ChunkStrategy } from './ChunkStrategy'
import type { RuntimeProgress } from './RuntimeProgress'
import type { RuntimeEvent } from './RuntimeEvent'

// Adaptive Learning Runtime™ (LSE-2). Real versioning envelope —
// identical pattern to every prior *Version type in this arc.
export type RuntimeVersion = {
  schemaVersion: string
  revision: number
}

// `SessionPosition` (`{ queueIndex, chunkNodeId }`) is the exact right
// shape for a position within any `LearningQueue` — reused verbatim
// rather than redefining an identical type under a new name.
export type RuntimePosition = SessionPosition

// Adaptive Learning Runtime™ — the canonical output of LSE-2. Wraps a
// real LSE-1 `LearningSession` (never mutated, never reimplemented —
// `pauseRuntime`/`resumeRuntime`/`completeRuntime` delegate to LSE-1's
// own `pauseSession`/`resumeSession`/`completeSession` for exactly this
// field) and adds the genuinely new runtime-layer state LSE-1 has no
// concept of: `strategy` + `scheduledQueue` (Chunk Scheduling's real
// output — the same queue items as `session.queue`, real-reordered per
// `strategy`; LSE-1's own queue is fixed to natural document order by
// design and is never reordered, so the adaptive-ordered walk needs its
// own queue and its own `position`/`progress`/`eventLog` computed
// against it — see internal/ for why these can't be LSE-1's internals,
// which aren't part of LSE-1's public barrel).
//
// `repeatCounts` / `skippedChunkIds` / `revisitChunkIds` are real,
// runtime-owned bookkeeping for the `repeat-chunk`/`skip-chunk`/
// `revisit-later` decisions LSE-1 has no equivalent of.
export type AdaptiveRuntimeState = {
  id: string
  session: LearningSession
  strategy: ChunkStrategy
  scheduledQueue: LearningQueue
  position: RuntimePosition
  progress: RuntimeProgress
  skippedChunkIds: readonly string[]
  revisitChunkIds: readonly string[]
  repeatCounts: Readonly<Record<string, number>>
  eventLog: readonly RuntimeEvent[]
  version: RuntimeVersion
  createdAt: string
  lastModifiedAt: string
}
