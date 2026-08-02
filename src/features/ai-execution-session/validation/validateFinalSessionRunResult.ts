import type { SessionRunResult, SessionValidation, SessionValidationIssue } from '../types'

// Pure — "Invalid session state" / "Invalid completion" (§ brief):
// checks the final `SessionRunResult` is internally consistent —
// `completed` must carry a `result` and no `failureReason`;
// `failed`/`cancelled` must carry no `result`; `session.state` must
// agree with `completionStatus`.
export function validateFinalSessionRunResult(runResult: SessionRunResult): SessionValidation {
  const issues: SessionValidationIssue[] = []

  if (runResult.completionStatus === 'completed' && (runResult.result === null || runResult.failureReason !== null)) {
    issues.push({ type: 'invalid-completion', detail: 'A completed result must carry a result and no failureReason.' })
  }

  if (runResult.completionStatus !== 'completed' && runResult.result !== null) {
    issues.push({ type: 'invalid-completion', detail: `A "${runResult.completionStatus}" result must not carry a result.` })
  }

  if (runResult.completionStatus !== runResult.session.state) {
    issues.push({ type: 'invalid-session-state', detail: `session.state "${runResult.session.state}" does not agree with completionStatus "${runResult.completionStatus}".` })
  }

  return { valid: issues.length === 0, issues }
}
