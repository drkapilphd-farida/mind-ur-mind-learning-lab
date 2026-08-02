import type { LearningSession } from './LearningSession'
import type { SessionEvent } from './SessionEvent'
import type { SessionActionError } from './SessionActionError'

// Universal Learning Session Engine™ (LSE-1). The one shared result
// shape every session action (start/continue/pause/resume/complete/
// cancel/restart) returns — real Result-type convention, never a thrown
// exception. `events` are the real events THIS call produced (not the
// full accumulated log — see `session.eventLog` for that).
export type SessionActionOptions = {
  now?: () => Date
  idFactory?: () => string
}

export type SessionActionResult = { success: true; session: LearningSession; events: readonly SessionEvent[] } | { success: false; error: SessionActionError }
