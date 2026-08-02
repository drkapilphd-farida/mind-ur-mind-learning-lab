import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { completeSession } from '@/core/learning-session-engine'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionResult } from '../types/RuntimeActionResult'
import { applyChunkStrategy } from './applyChunkStrategy'
import { computeRuntimeProgress } from './computeRuntimeProgress'
import { buildAdvanceEvents } from './buildAdvanceEvents'
import { findQueueIndex } from './navigateQueue'
import { getNextRemainingItem } from './getNextRemainingItem'

// Adaptive Learning Runtime™ (LSE-2). Adaptive Learning Flow. Pure
// orchestration shared by every decision that moves the runtime forward
// (`continueRuntime`, `skipChunk`): re-applies Chunk Scheduling fresh
// from LSE-1's own natural-order `session.queue` (so a revisit/skip
// made this call is reflected immediately), finds the real next
// remaining item, and either advances `position`/`progress`/`eventLog`
// onto it, or — if none remains — delegates to LSE-1's own public
// `completeSession` ("safe to call regardless of remaining queue
// items") since the adaptive queue is genuinely exhausted. Callers
// prepend their own real leading event (`chunk-completed` for continue,
// `chunk-skipped` for skip) via `priorEvents`.
export function advanceRuntime(state: AdaptiveRuntimeState, ulo: UniversalLearningObject, completedChunkIds: readonly string[], priorEvents: readonly RuntimeEvent[], now: () => Date, idFactory: () => string): RuntimeActionResult {
  const nowIso = now().toISOString()
  const scheduledQueue = applyChunkStrategy(state.strategy, state.session.queue, ulo, state.revisitChunkIds, state.skippedChunkIds)
  const progress = computeRuntimeProgress(scheduledQueue, completedChunkIds, state.skippedChunkIds, state.revisitChunkIds, ulo)
  const nextItem = getNextRemainingItem(scheduledQueue, completedChunkIds, state.skippedChunkIds)

  const events: RuntimeEvent[] = [...priorEvents]

  if (nextItem) {
    const nextQueueIndex = findQueueIndex(scheduledQueue, nextItem.chunkNodeId)
    events.push(...buildAdvanceEvents(scheduledQueue, nextQueueIndex, now, idFactory))
    events.push({ id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage })

    const nextState: AdaptiveRuntimeState = {
      ...state,
      version: { ...state.version, revision: state.version.revision + 1 },
      scheduledQueue,
      position: { queueIndex: nextQueueIndex, chunkNodeId: nextItem.chunkNodeId },
      progress,
      eventLog: [...state.eventLog, ...events],
      lastModifiedAt: nowIso,
    }

    return { success: true, state: nextState, events }
  }

  events.push({ id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage })
  events.push({ id: idFactory(), type: 'runtime-completed', occurredAt: nowIso })

  const completeSessionResult = completeSession(state.session, ulo, { now, idFactory })
  if (!completeSessionResult.success) return { success: false, error: completeSessionResult.error }

  const nextState: AdaptiveRuntimeState = {
    ...state,
    session: completeSessionResult.session,
    version: { ...state.version, revision: state.version.revision + 1 },
    scheduledQueue,
    position: { queueIndex: scheduledQueue.items.length, chunkNodeId: null },
    progress,
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
