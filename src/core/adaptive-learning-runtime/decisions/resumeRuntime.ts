import { resumeSession } from '@/core/learning-session-engine'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeEvent } from '../types/RuntimeEvent'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'

// Adaptive Learning Runtime™ (LSE-2). Runtime Decision Engine — Resume.
// Real: delegates to LSE-1's own public `resumeSession` for the wrapped
// `session` — never reimplements resume. `scheduledQueue`/`position`/
// `progress` are left untouched, only a real `runtime-resumed` event is
// appended to the runtime's own log.
export function resumeRuntime(state: AdaptiveRuntimeState, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('resume', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const sessionResult = resumeSession(state.session, options)
  if (!sessionResult.success) return { success: false, error: sessionResult.error }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const events: RuntimeEvent[] = [{ id: idFactory(), type: 'runtime-resumed', occurredAt: nowIso }]

  const nextState: AdaptiveRuntimeState = {
    ...state,
    session: sessionResult.session,
    version: { ...state.version, revision: state.version.revision + 1 },
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, state: nextState, events }
}
