// Immutable — every field `readonly`. `evaluateRetryBudget()`'s own
// output.
export type RetryBudgetStatus = {
  readonly remaining: number
  readonly exhausted: boolean
}
