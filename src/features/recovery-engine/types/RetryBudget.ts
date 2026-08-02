// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — this sprint's own "retry policy": the maximum
// number of attempts a recovery run is allowed.
export type RetryBudget = {
  readonly maxAttempts: number
}
