import type { LearningSession } from '../types/LearningSession'
import type { SessionActionOptions, SessionActionResult } from '../types/SessionActionResult'
import { validateTransition } from '../internal/validateTransition'

// Universal Learning Session Engine™ (LSE-1). Cancels a session from
// any real valid source status. No `session-cancelled` event exists in
// the brief's 7-event list — the status change itself, plus
// `cancelledAt`, is the real, disclosed signal, never an invented 8th
// event type.
export function cancelSession(session: LearningSession, options: SessionActionOptions = {}): SessionActionResult {
  const transition = validateTransition('cancel', session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const now = options.now ?? (() => new Date())
  const nowIso = now().toISOString()

  const updatedSession: LearningSession = {
    ...session,
    version: { ...session.version, revision: session.version.revision + 1 },
    status: 'cancelled',
    cancelledAt: nowIso,
    lastModifiedAt: nowIso,
  }

  return { success: true, session: updatedSession, events: [] }
}
