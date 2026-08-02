import type { ExecutionPolicyValidation, ExecutionPolicyValidationIssue, FallbackEligibilityPolicy } from '../types'

// Pure — "Circular fallback" (§ brief). The same fallback provider id
// appearing more than once in the configured chain would loop back on
// itself at runtime.
export function validateCircularFallback(policy: FallbackEligibilityPolicy): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (new Set(policy.fallbackProviderIds).size !== policy.fallbackProviderIds.length) {
    issues.push({ type: 'circular-fallback', detail: 'The fallback provider chain contains a duplicate provider id.' })
  }

  return { valid: issues.length === 0, issues }
}
