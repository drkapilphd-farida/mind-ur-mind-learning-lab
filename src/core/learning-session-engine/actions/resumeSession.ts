import type { LearningSession } from '../types/LearningSession'
import type { SessionActionOptions, SessionActionResult } from '../types/SessionActionResult'
import { validateTransition } from '../internal/validateTransition'

// Universal Learning Session Engine™ (LSE-1). Resumes a paused session
// — real queue/position/progress are left untouched, only status
// changes and a real session-resumed event is appended.
export function resumeSession(session: LearningSession, options: SessionActionOptions = {}): SessionActionResult {
  const transition = validateTransition('resume', session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const events = [{ id: idFactory(), type: 'session-resumed' as const, occurredAt: nowIso }]

  const updatedSession: LearningSession = {
    ...session,
    version: { ...session.version, revision: session.version.revision + 1 },
    status: 'active',
    eventLog: [...session.eventLog, ...events],
    lastModifiedAt: nowIso,
  }

  return { success: true, session: updatedSession, events }
}
