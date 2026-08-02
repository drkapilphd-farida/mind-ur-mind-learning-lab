import { validateSessionRegistration } from '../validation'
import type { AIExecutionSession, SessionValidation } from '../types'
import type { AIExecutionSessionManager } from './AIExecutionSessionManager'

// In-memory session store, keyed by session id — same "self-contained
// registry" discipline as every prior sprint's own registry
// (`provider-selection-engine`/`model-selection-engine`).
export class DefaultAIExecutionSessionManager implements AIExecutionSessionManager {
  private readonly sessions = new Map<string, AIExecutionSession>()

  register(session: AIExecutionSession): SessionValidation {
    const validationResult = validateSessionRegistration(Array.from(this.sessions.keys()), session.id)

    if (validationResult.valid) {
      this.sessions.set(session.id, session)
    }

    return validationResult
  }

  update(session: AIExecutionSession): void {
    if (this.sessions.has(session.id)) {
      this.sessions.set(session.id, session)
    }
  }

  get(sessionId: string): AIExecutionSession | undefined {
    return this.sessions.get(sessionId)
  }

  list(): readonly AIExecutionSession[] {
    return Array.from(this.sessions.values())
  }
}

export function createAIExecutionSessionManager(): AIExecutionSessionManager {
  return new DefaultAIExecutionSessionManager()
}
