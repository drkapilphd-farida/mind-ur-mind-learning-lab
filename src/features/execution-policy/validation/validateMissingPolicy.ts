import type { ExecutionPolicyConfig, ExecutionPolicyValidation, ExecutionPolicyValidationIssue } from '../types'

// Pure — "Missing policy" (§ brief). A config with no eligible
// providers at all has no usable policy to apply.
export function validateMissingPolicy(config: ExecutionPolicyConfig): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (config.constraints.eligibleProviderIds.length === 0) {
    issues.push({ type: 'missing-policy', detail: 'The policy configuration declares no eligible providers.' })
  }

  return { valid: issues.length === 0, issues }
}
