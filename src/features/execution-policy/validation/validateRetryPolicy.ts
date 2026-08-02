import type { ExecutionPolicyValidation, ExecutionPolicyValidationIssue, RetryEligibilityPolicy } from '../types'

// Pure — "Invalid retry count" (§ brief).
export function validateRetryPolicy(policy: RetryEligibilityPolicy): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (!Number.isFinite(policy.maxAttempts) || policy.maxAttempts < 1) {
    issues.push({ type: 'invalid-retry-count', detail: `maxAttempts ${policy.maxAttempts} must be a finite number of at least 1.` })
  }

  return { valid: issues.length === 0, issues }
}
