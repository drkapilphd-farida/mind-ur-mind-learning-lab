import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { getQueueItemAt } from '../internal/navigateQueue'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Repeat
// Chunk. Real: mark-only, does not advance `position` — the learner
// stays on the same real scheduled item. `repeatCounts[chunkNodeId]`
// increments by one (real runtime-owned bookkeeping LSE-1 has no
// equivalent of), and a real `chunk-repeated` event carries the new
// count.
export function repeatChunk(state: AdaptiveRuntimeState, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('repeat-chunk', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const currentItem = getQueueItemAt(state.scheduledQueue, state.position.queueIndex)
  if (!currentItem) return { success: false, error: { code: 'chunk-not-in-queue', message: 'No chunk currently in view to repeat.' } }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const repeatCount = (state.repeatCounts[currentItem.chunkNodeId] ?? 0) + 1
  const events: RuntimeEvent[] = [{ id: idFactory(), type: 'chunk-repeated', occurredAt: nowIso, chunkNodeId: currentItem.chunkNodeId, repeatCount }]

  const nextState: AdaptiveRuntimeState = {
    ...state,
    version: { ...state.version, revision: state.version.revision + 1 },
    repeatCounts: { ...state.repeatCounts, [currentItem.chunkNodeId]: repeatCount },
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
