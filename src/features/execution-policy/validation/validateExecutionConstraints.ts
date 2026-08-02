import type { ExecutionConstraints, ExecutionPolicyValidation, ExecutionPolicyValidationIssue } from '../types'

// Pure — "Invalid constraint" (§ brief).
export function validateExecutionConstraints(constraints: ExecutionConstraints): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (!Number.isFinite(constraints.maxConcurrentAttempts) || constraints.maxConcurrentAttempts <= 0) {
    issues.push({ type: 'invalid-constraint', detail: `maxConcurrentAttempts ${constraints.maxConcurrentAttempts} must be a positive finite number.` })
  }

  return { valid: issues.length === 0, issues }
}
