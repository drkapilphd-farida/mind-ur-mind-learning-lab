import type { AIExecutionSession, SessionDiagnostics, SessionValidation } from '../types'

// Pure — one of the brief's own 10 named responsibilities
// ("SessionDiagnostics"). Assembles a full record of one session run
// from its already-computed pieces — same "pure generator takes
// pre-computed pieces" pattern as every prior sprint's diagnostics
// module.
export function generateSessionDiagnostics(session: AIExecutionSession, validationResult: SessionValidation): SessionDiagnostics {
  return {
    sessionId: session.id,
    finalState: session.state,
    eventCount: session.eventLog.events.length,
    validationResult,
    providerId: session.context.providerId,
    modelId: session.context.modelId,
  }
}
