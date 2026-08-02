import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { completeSession } from '@/core/learning-session-engine'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { computeRuntimeProgress } from '../internal/computeRuntimeProgress'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine —
// Complete Session. Explicit early completion, mirroring LSE-1's own
// `completeSession`'s real "regardless of remaining queue items"
// semantics — real: delegates to it for the wrapped `session`, and
// recomputes the runtime's own `progress` treating every real scheduled
// item as completed via the one shared `computeRuntimeProgress`, never
// a hardcoded "100%" literal.
export function completeRuntime(state: AdaptiveRuntimeState, ulo: UniversalLearningObject, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('complete', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const sessionResult = completeSession(state.session, ulo, options)
  if (!sessionResult.success) return { success: false, error: sessionResult.error }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const allChunkIds = state.scheduledQueue.items.map((item) => item.chunkNodeId)
  const progress = computeRuntimeProgress(state.scheduledQueue, allChunkIds, state.skippedChunkIds, state.revisitChunkIds, ulo)

  const events: RuntimeEvent[] = [
    { id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage },
    { id: idFactory(), type: 'runtime-completed', occurredAt: nowIso },
  ]

  const nextState: AdaptiveRuntimeState = {
    ...state,
    session: sessionResult.session,
    version: { ...state.version, revision: state.version.revision + 1 },
    position: { queueIndex: state.scheduledQueue.items.length, chunkNodeId: null },
    progress,
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
