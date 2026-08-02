import type { AIExecutionSession, SessionRunResult, SessionValidationIssueType } from '../types'
import type { SessionFailureHandler } from './SessionFailureHandler'

export class DefaultSessionFailureHandler implements SessionFailureHandler {
  handle(session: AIExecutionSession, issueType: SessionValidationIssueType, detail: string): SessionRunResult {
    const completionStatus = session.state === 'cancelled' ? 'cancelled' : 'failed'

    return {
      session,
      completionStatus,
      result: null,
      failureReason: detail,
      validationResult: { valid: false, issues: [{ type: issueType, detail }] },
      diagnostics: {
        sessionId: session.id,
        finalState: session.state,
        eventCount: session.eventLog.events.length,
        validationResult: { valid: false, issues: [{ type: issueType, detail }] },
        providerId: session.context.providerId,
        modelId: session.context.modelId,
      },
    }
  }
}

export function createSessionFailureHandler(): SessionFailureHandler {
  return new DefaultSessionFailureHandler()
}
