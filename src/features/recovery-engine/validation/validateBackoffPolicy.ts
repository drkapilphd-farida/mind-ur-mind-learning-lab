import type { BackoffPolicy, RecoveryValidation, RecoveryValidationIssue } from '../types'

// Pure — "Invalid backoff" (§ brief).
export function validateBackoffPolicy(policy: BackoffPolicy): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (!Number.isFinite(policy.baseDelayMs) || policy.baseDelayMs <= 0) {
    issues.push({ type: 'invalid-backoff', detail: `baseDelayMs ${policy.baseDelayMs} must be a positive finite number.` })
  }

  if (!Number.isFinite(policy.maxDelayMs) || policy.maxDelayMs <= 0) {
    issues.push({ type: 'invalid-backoff', detail: `maxDelayMs ${policy.maxDelayMs} must be a positive finite number.` })
  }

  if (Number.isFinite(policy.baseDelayMs) && Number.isFinite(policy.maxDelayMs) && policy.maxDelayMs < policy.baseDelayMs) {
    issues.push({ type: 'invalid-backoff', detail: `maxDelayMs ${policy.maxDelayMs} must not be less than baseDelayMs ${policy.baseDelayMs}.` })
  }

  return { valid: issues.length === 0, issues }
}
