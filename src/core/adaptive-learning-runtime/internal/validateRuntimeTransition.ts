import type { SessionStatus } from '@/core/learning-session-engine'
import type { RuntimeActionError } from '../types/RuntimeActionError'

export type RuntimeTransition = 'continue' | 'pause' | 'resume' | 'repeat-chunk' | 'skip-chunk' | 'revisit-later' | 'checkpoint' | 'complete' | 'previous-chunk'

export type ValidateRuntimeTransitionResult = { success: true } | { success: false; error: RuntimeActionError }

// Adaptive Learning Runtime™ (LSE-2). The one real legal-transition
// table every runtime decision in decisions/ (other than `start`, which
// constructs a fresh state rather than transitioning one — the same
// disclosed exception LSE-1's own `startSession` makes) calls before
// doing anything else, never hardcoding its own precondition. Mirrors
// LSE-1's own `validateTransition.ts` table for the statuses they
// share; `repeat-chunk`/`skip-chunk`/`revisit-later`/`checkpoint` are
// new here — all four only make sense against a chunk actively in view,
// so all four require `'active'`, same as `continue`. `previous-chunk`
// (QSR Sprint-1 amendment) requires the same — navigating backward only
// makes sense while actively viewing the queue.
const ALLOWED_FROM_STATUSES: Record<RuntimeTransition, readonly SessionStatus[]> = {
  continue: ['active'],
  pause: ['active'],
  resume: ['paused'],
  'repeat-chunk': ['active'],
  'skip-chunk': ['active'],
  'revisit-later': ['active'],
  checkpoint: ['active'],
  complete: ['active'],
  'previous-chunk': ['active'],
}

// Pure. Never throws — a real, expected, guarded failure (an illegal
// transition) is Result-type data, the same convention this whole arc
// uses throughout.
export function validateRuntimeTransition(transition: RuntimeTransition, currentStatus: SessionStatus): ValidateRuntimeTransitionResult {
  const allowed = ALLOWED_FROM_STATUSES[transition]
  if (allowed.includes(currentStatus)) return { success: true }

  return {
    success: false,
    error: {
      code: 'invalid-transition',
      message: `Cannot "${transition}" a runtime in status "${currentStatus}".`,
    },
  }
}
