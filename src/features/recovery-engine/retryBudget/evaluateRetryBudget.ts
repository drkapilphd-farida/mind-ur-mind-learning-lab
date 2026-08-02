import type { RetryBudget, RetryBudgetStatus } from '../types'

// Pure — "retry exhaustion" (§ Responsibilities). `attemptCount` is
// how many attempts have already been made.
export function evaluateRetryBudget(attemptCount: number, budget: RetryBudget): RetryBudgetStatus {
  const remaining = Math.max(budget.maxAttempts - attemptCount, 0)

  return { remaining, exhausted: attemptCount >= budget.maxAttempts }
}
