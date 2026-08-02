import type { ExecutionPolicyRequest, ExecutionPolicyValidation, ExecutionPolicyValidationIssue } from '../types'

// Pure — "Invalid execution state" (§ brief). Checks the per-request
// facts are internally consistent — a negative attempt count/elapsed
// time, or a cancellation request with no real reason, is malformed.
export function validateExecutionState(request: ExecutionPolicyRequest): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (!Number.isFinite(request.attemptCount) || request.attemptCount < 0) {
    issues.push({ type: 'invalid-execution-state', detail: `attemptCount ${request.attemptCount} must be a non-negative finite number.` })
  }

  if (!Number.isFinite(request.elapsedMs) || request.elapsedMs < 0) {
    issues.push({ type: 'invalid-execution-state', detail: `elapsedMs ${request.elapsedMs} must be a non-negative finite number.` })
  }

  if (request.cancellationRequested && request.cancellationReason === 'none') {
    issues.push({ type: 'invalid-execution-state', detail: 'cancellationRequested is true but cancellationReason is "none".' })
  }

  return { valid: issues.length === 0, issues }
}
