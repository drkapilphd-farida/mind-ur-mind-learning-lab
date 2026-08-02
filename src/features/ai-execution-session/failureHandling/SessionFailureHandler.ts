import type { AIExecutionSession, SessionRunResult, SessionValidationIssueType } from '../types'

// One of the brief's own 10 named responsibilities — "Failure
// completion." Never throws; always produces the failed-or-cancelled
// shape `SessionRunResult`. `completionStatus` is inferred from
// `session.state` — `'cancelled'` if the session was cancelled,
// `'failed'` otherwise — so one handler serves both terminal,
// non-success outcomes.
export interface SessionFailureHandler {
  handle(session: AIExecutionSession, issueType: SessionValidationIssueType, detail: string): SessionRunResult
}
