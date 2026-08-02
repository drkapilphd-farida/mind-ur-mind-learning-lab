import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { getQueueItemAt } from '../internal/navigateQueue'
import { advanceRuntime } from '../internal/advanceRuntime'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Skip
// Chunk. Real: adds the current real chunk to `skippedChunkIds` (real
// runtime-owned bookkeeping LSE-1 has no equivalent of — it stays
// excluded from `getNextRemainingItem` until this session ends, unlike
// `revisit-later`, which never blocks re-selection), then hands off to
// the same shared Adaptive Learning Flow `continueRuntime` uses to
// schedule and advance to the real next remaining item.
export function skipChunk(state: AdaptiveRuntimeState, ulo: UniversalLearningObject, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('skip-chunk', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  if (state.session.uloId !== ulo.id) {
    return { success: false, error: { code: 'ulo-mismatch', message: `Runtime was built against ULO "${state.session.uloId}", not "${ulo.id}".` } }
  }

  const currentItem = getQueueItemAt(state.scheduledQueue, state.position.queueIndex)
  if (!currentItem) return { success: false, error: { code: 'chunk-not-in-queue', message: 'No chunk currently in view to skip.' } }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const skippedChunkIds = [...state.skippedChunkIds, currentItem.chunkNodeId]
  const priorEvents: RuntimeEvent[] = [{ id: idFactory(), type: 'chunk-skipped', occurredAt: nowIso, chunkNodeId: currentItem.chunkNodeId }]

  return advanceRuntime({ ...state, skippedChunkIds }, ulo, state.progress.completedChunkIds, priorEvents, now, idFactory)
}
