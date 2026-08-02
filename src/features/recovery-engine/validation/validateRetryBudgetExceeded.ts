import type { RecoveryContext, RecoveryValidation, RecoveryValidationIssue } from '../types'

// Pure — "Retry budget exceeded" (§ brief). Surfaced explicitly as its
// own validation concern, not silently folded into a strategy choice.
export function validateRetryBudgetExceeded(context: RecoveryContext): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (context.attemptCount >= context.retryBudget.maxAttempts) {
    issues.push({
      type: 'retry-budget-exceeded',
      detail: `attemptCount ${context.attemptCount} has reached or exceeded the configured maxAttempts ${context.retryBudget.maxAttempts}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
