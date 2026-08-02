import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { getQueueItemAt } from '../internal/navigateQueue'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine +
// Checkpoint Runtime (explicit half — the automatic half lives in
// `internal/buildAdvanceEvents.ts`, fired on arrival). A learner (or a
// future Learning Mode) can explicitly acknowledge the checkpoint at
// the current position. Real, honest no-op — success with zero events
// — when the current item genuinely isn't a checkpoint, never a
// fabricated error for calling this at a harmless time.
export function checkpointRuntime(state: AdaptiveRuntimeState, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('checkpoint', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const currentItem = getQueueItemAt(state.scheduledQueue, state.position.queueIndex)
  if (!currentItem || !currentItem.isCheckpoint || currentItem.checkpointConceptNodeId === undefined || currentItem.checkpointLabel === undefined) {
    return { success: true, state, events: [] }
  }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const events: RuntimeEvent[] = [{ id: idFactory(), type: 'checkpoint-reached', occurredAt: nowIso, conceptNodeId: currentItem.checkpointConceptNodeId, label: currentItem.checkpointLabel }]

  const nextState: AdaptiveRuntimeState = {
    ...state,
    version: { ...state.version, revision: state.version.revision + 1 },
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
