import type { SessionContext, SessionContextLifecycleState } from '../domain'
import { IllegalSessionContextLifecycleTransitionError } from './IllegalSessionContextLifecycleTransitionError'

// The legal transition graph: Created -> Active, Active <-> Suspended
// (pause/resume), and every non-terminal state -> Closed (terminal).
// Pure — never mutates the given SessionContext, always returns a new
// one with `updatedAt` set to the given `now`.
const ALLOWED_TRANSITIONS: Record<SessionContextLifecycleState, readonly SessionContextLifecycleState[]> = {
  created: ['active', 'closed'],
  active: ['suspended', 'closed'],
  suspended: ['active', 'closed'],
  closed: [],
}

export function transitionSessionContextLifecycle(
  context: SessionContext,
  to: SessionContextLifecycleState,
  now: string,
): SessionContext {
  const allowed = ALLOWED_TRANSITIONS[context.lifecycle]
  if (!allowed.includes(to)) throw new IllegalSessionContextLifecycleTransitionError(context.lifecycle, to)
  return { ...context, lifecycle: to, updatedAt: now }
}

// Named helpers for the 3 transitions ContextOrchestrationService
// actually drives — deliberately distinct names from the service's own
// method names (`suspendSession`, `resumeSession`, `closeSession`) to
// keep every call site unambiguous about which one it means.
export function moveSessionToActive(context: SessionContext, now: string): SessionContext {
  return transitionSessionContextLifecycle(context, 'active', now)
}

export function moveSessionToSuspended(context: SessionContext, now: string): SessionContext {
  return transitionSessionContextLifecycle(context, 'suspended', now)
}

export function moveSessionToClosed(context: SessionContext, now: string): SessionContext {
  return transitionSessionContextLifecycle(context, 'closed', now)
}
