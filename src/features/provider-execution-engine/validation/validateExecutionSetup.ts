import type { ExecutionSession } from '../types'
import type { ExecutionValidationIssue } from './ExecutionValidationIssue'
import type { ExecutionValidationResult } from './ExecutionValidationResult'

const KNOWN_PROVIDER_IDS: readonly string[] = ['openai', 'anthropic', 'gemini']

// Pure — "Validate ExecutionRequest, ProviderConfig, ExecutionPolicy,
// RetryPolicy, CancellationPolicy, TimeoutPolicy. Reject invalid
// execution before runtime." Checks, in order:
//
// - invalid-execution-request: blank `request.id`.
// - invalid-provider-config: `providerId` outside the known 3-value
//   set.
// - invalid-retry-policy: `maxAttempts < 1`.
// - invalid-timeout-policy: `deadlineMs <= 0`.
// - invalid-cancellation-policy: neither manual nor safety
//   cancellation is permitted — a policy that permits no cancellation
//   at all is rejected as too restrictive.
// - invalid-execution-policy: `maxAttempts`/`deadlineMs` is non-finite
//   (NaN/Infinity) — a malformed policy the individual field checks
//   above wouldn't otherwise distinguish from "too low."
export function validateExecutionSetup(session: ExecutionSession): ExecutionValidationResult {
  const issues: ExecutionValidationIssue[] = []
  const { request, policy } = session

  if (!request.id.trim()) {
    issues.push({ type: 'invalid-execution-request', detail: 'The execution request has an empty id.' })
  }

  if (!KNOWN_PROVIDER_IDS.includes(request.providerId)) {
    issues.push({ type: 'invalid-provider-config', detail: `Provider id "${request.providerId}" is not a known profile.` })
  }

  if (policy.retryPolicy.maxAttempts < 1) {
    issues.push({ type: 'invalid-retry-policy', detail: `maxAttempts ${policy.retryPolicy.maxAttempts} must be at least 1.` })
  }

  if (policy.timeoutPolicy.deadlineMs <= 0) {
    issues.push({ type: 'invalid-timeout-policy', detail: `deadlineMs ${policy.timeoutPolicy.deadlineMs} must be greater than 0.` })
  }

  if (!policy.cancellationPolicy.allowManualCancellation && !policy.cancellationPolicy.allowSafetyCancellation) {
    issues.push({ type: 'invalid-cancellation-policy', detail: 'The cancellation policy permits neither manual nor safety cancellation.' })
  }

  if (!Number.isFinite(policy.retryPolicy.maxAttempts) || !Number.isFinite(policy.timeoutPolicy.deadlineMs)) {
    issues.push({ type: 'invalid-execution-policy', detail: 'The execution policy contains a non-finite value.' })
  }

  return { valid: issues.length === 0, issues }
}
