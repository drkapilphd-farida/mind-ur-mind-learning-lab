import type { SessionType, UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { startSession } from '@/core/learning-session-engine'
import type { ChunkStrategy } from '../types/ChunkStrategy'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { applyChunkStrategy } from '../internal/applyChunkStrategy'
import { computeRuntimeProgress } from '../internal/computeRuntimeProgress'
import { buildAdvanceEvents } from '../internal/buildAdvanceEvents'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Start.
// Real: delegates to LSE-1's own public `startSession` for the wrapped
// `session` (identity, timestamps, natural-order queue, LSE-1's own
// status/eventLog) — never reimplements session construction. Chunk
// Scheduling then computes the real `scheduledQueue` for the chosen
// `strategy` from that same real natural-order queue, and the runtime's
// own position/progress/eventLog are computed against THAT queue (see
// types/AdaptiveRuntimeState.ts for why these can't just alias LSE-1's
// own `session.position`/`session.progress`).
export function startRuntime(ulo: UniversalLearningObject, learnerId: string, sessionType: SessionType, strategy: ChunkStrategy, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const sessionResult = startSession(ulo, learnerId, sessionType, options)
  if (!sessionResult.success) return { success: false, error: sessionResult.error }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const { session } = sessionResult
  const scheduledQueue = applyChunkStrategy(strategy, session.queue, ulo, [], [])
  const hasItems = scheduledQueue.items.length > 0
  const progress = computeRuntimeProgress(scheduledQueue, [], [], [], ulo)

  const position = { queueIndex: 0, chunkNodeId: hasItems ? (scheduledQueue.items[0]?.chunkNodeId ?? null) : null }
  const positionEvents = hasItems ? buildAdvanceEvents(scheduledQueue, 0, now, idFactory) : []
  const progressEvent: RuntimeEvent = { id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage }

  const events: RuntimeEvent[] = [...positionEvents, progressEvent]
  if (!hasItems) events.push({ id: idFactory(), type: 'runtime-completed', occurredAt: nowIso })

  const state: AdaptiveRuntimeState = {
    id: idFactory(),
    session,
    strategy,
    scheduledQueue,
    position,
    progress,
    skippedChunkIds: [],
    revisitChunkIds: [],
    repeatCounts: {},
    eventLog: events,
    version: { schemaVersion: '1.0.0', revision: 1 },
    createdAt: nowIso,
    lastModifiedAt: nowIso,
  }

  return { success: true, state, events }
}
