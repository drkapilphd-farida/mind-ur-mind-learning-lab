import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { getQueueItemAt } from '../internal/navigateQueue'
import { advanceRuntime } from '../internal/advanceRuntime'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Continue.
// Marks the runtime's current scheduled position completed, then hands
// off to the shared Adaptive Learning Flow (`internal/advanceRuntime.ts`)
// to schedule and advance to the real next remaining item.
export function continueRuntime(state: AdaptiveRuntimeState, ulo: UniversalLearningObject, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('continue', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  if (state.session.uloId !== ulo.id) {
    return { success: false, error: { code: 'ulo-mismatch', message: `Runtime was built against ULO "${state.session.uloId}", not "${ulo.id}".` } }
  }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const currentItem = getQueueItemAt(state.scheduledQueue, state.position.queueIndex)
  const completedChunkIds = currentItem ? [...state.progress.completedChunkIds, currentItem.chunkNodeId] : state.progress.completedChunkIds
  const priorEvents: RuntimeEvent[] = currentItem ? [{ id: idFactory(), type: 'chunk-completed', occurredAt: nowIso, chunkNodeId: currentItem.chunkNodeId }] : []

  return advanceRuntime(state, ulo, completedChunkIds, priorEvents, now, idFactory)
}
