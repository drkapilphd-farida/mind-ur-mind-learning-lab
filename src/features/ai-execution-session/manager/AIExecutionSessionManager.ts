import type { AIExecutionSession, SessionValidation } from '../types'

// One of the brief's own 10 named responsibilities — the in-memory
// session registry: "Session creation," "Duplicate session id."
export interface AIExecutionSessionManager {
  register(session: AIExecutionSession): SessionValidation
  update(session: AIExecutionSession): void
  get(sessionId: string): AIExecutionSession | undefined
  list(): readonly AIExecutionSession[]
}
