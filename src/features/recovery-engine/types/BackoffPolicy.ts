// "## Backoff" (§ brief), verbatim.
export type BackoffStrategyType = 'immediate' | 'fixed' | 'linear' | 'exponential'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — no naming collision found, used brief-exact.
export type BackoffPolicy = {
  readonly strategy: BackoffStrategyType
  readonly baseDelayMs: number
  readonly maxDelayMs: number
}
