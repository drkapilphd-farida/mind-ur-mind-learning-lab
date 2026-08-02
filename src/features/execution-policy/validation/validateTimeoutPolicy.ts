import type { ExecutionPolicyValidation, ExecutionPolicyValidationIssue, TimeoutResolutionPolicy } from '../types'

// Pure — "Invalid timeout" (§ brief).
export function validateTimeoutPolicy(policy: TimeoutResolutionPolicy): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (!Number.isFinite(policy.deadlineMs) || policy.deadlineMs <= 0) {
    issues.push({ type: 'invalid-timeout', detail: `deadlineMs ${policy.deadlineMs} must be a positive finite number.` })
  }

  return { valid: issues.length === 0, issues }
}
