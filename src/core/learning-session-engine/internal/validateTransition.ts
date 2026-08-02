import type { SessionStatus } from '../types/SessionStatus'
import type { SessionActionError } from '../types/SessionActionError'

export type SessionTransition = 'start' | 'continue' | 'pause' | 'resume' | 'complete' | 'cancel' | 'restart'

export type ValidateTransitionResult = { success: true } | { success: false; error: SessionActionError }

// The one real legal-transition table — every session action in
// actions/ calls this before doing anything else, never hardcoding its
// own precondition ("No duplicate session logic"). `restart` is
// deliberately allowed from `'any'` real status — a learner can always
// start over, regardless of how the previous attempt ended.
const ALLOWED_FROM_STATUSES: Record<SessionTransition, readonly SessionStatus[] | 'any'> = {
  start: ['not-started'],
  continue: ['active'],
  pause: ['active'],
  resume: ['paused'],
  complete: ['active'],
  cancel: ['not-started', 'active', 'paused'],
  restart: 'any',
}

// Universal Learning Session Engine™ (LSE-1). Pure. Never throws — a
// real, expected, guarded failure (an illegal transition) is Result-
// type data, the same convention this whole arc has used throughout.
export function validateTransition(transition: SessionTransition, currentStatus: SessionStatus): ValidateTransitionResult {
  const allowed = ALLOWED_FROM_STATUSES[transition]
  if (allowed === 'any' || allowed.includes(currentStatus)) return { success: true }

  return {
    success: false,
    error: {
      code: 'invalid-transition',
      message: `Cannot "${transition}" a session in status "${currentStatus}".`,
    },
  }
}
