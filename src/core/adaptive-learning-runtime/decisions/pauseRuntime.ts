import { pauseSession } from '@/core/learning-session-engine'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Pause.
// Real: delegates to LSE-1's own public `pauseSession` for the wrapped
// `session` — never reimplements pause. `scheduledQueue`/`position`/
// `progress` are left untouched (a pause doesn't move the learner);
// only a real `runtime-paused` event is appended to the runtime's own
// log.
export function pauseRuntime(state: AdaptiveRuntimeState, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('pause', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const sessionResult = pauseSession(state.session, options)
  if (!sessionResult.success) return { success: false, error: sessionResult.error }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const events: RuntimeEvent[] = [{ id: idFactory(), type: 'runtime-paused', occurredAt: nowIso }]

  const nextState: AdaptiveRuntimeState = {
    ...state,
    session: sessionResult.session,
    version: { ...state.version, revision: state.version.revision + 1 },
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
