import type { ExecutionPolicyValidation, ExecutionPolicyValidationIssue, FallbackEligibilityPolicy } from '../types'

// Pure — "Invalid fallback" (§ brief). A policy that claims fallback
// is allowed but names no fallback providers is malformed.
export function validateFallbackPolicy(policy: FallbackEligibilityPolicy): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (policy.allowFallback && policy.fallbackProviderIds.length === 0) {
    issues.push({ type: 'invalid-fallback', detail: 'Fallback is allowed but no fallbackProviderIds are configured.' })
  }

  return { valid: issues.length === 0, issues }
}
