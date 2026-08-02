import type { RecoveryValidation, RecoveryValidationIssue, RetryBudget } from '../types'

// Pure — "Invalid retry policy" (§ brief). `RetryBudget` *is* this
// sprint's own retry policy — no separate "RetryPolicy" type is
// brief-named this time.
export function validateRetryPolicy(budget: RetryBudget): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (!Number.isFinite(budget.maxAttempts) || budget.maxAttempts < 1) {
    issues.push({ type: 'invalid-retry-policy', detail: `maxAttempts ${budget.maxAttempts} must be a finite number of at least 1.` })
  }

  return { valid: issues.length === 0, issues }
}
