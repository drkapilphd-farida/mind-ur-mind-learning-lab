import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { getQueueItemAt } from '../internal/navigateQueue'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Revisit
// Later. Real: mark-only, mirroring `repeatChunk` — does not advance
// `position`. Adds the current real chunk to `revisitChunkIds` (real
// runtime-owned bookkeeping LSE-1 has no equivalent of; idempotent — a
// chunk already marked isn't added twice). The Adaptive Queue
// chunk-scheduling strategy is what actually acts on this mark, pulling
// the chunk to the front on the next scheduling pass — this decision
// only records the intent.
export function revisitLater(state: AdaptiveRuntimeState, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('revisit-later', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const currentItem = getQueueItemAt(state.scheduledQueue, state.position.queueIndex)
  if (!currentItem) return { success: false, error: { code: 'chunk-not-in-queue', message: 'No chunk currently in view to mark for revisit.' } }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const alreadyMarked = state.revisitChunkIds.includes(currentItem.chunkNodeId)
  const revisitChunkIds = alreadyMarked ? state.revisitChunkIds : [...state.revisitChunkIds, currentItem.chunkNodeId]
  const events: RuntimeEvent[] = [{ id: idFactory(), type: 'chunk-marked-for-revisit', occurredAt: nowIso, chunkNodeId: currentItem.chunkNodeId }]

  const nextState: AdaptiveRuntimeState = {
    ...state,
    version: { ...state.version, revision: state.version.revision + 1 },
    revisitChunkIds,
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
