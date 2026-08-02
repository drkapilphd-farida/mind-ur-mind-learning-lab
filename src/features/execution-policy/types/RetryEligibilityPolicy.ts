// The brief's own "RetryPolicy" responsibility, renamed — a real,
// exact collision found via repo-wide grep with
// `ai-provider/types/RetryPolicy.ts` (a different, real provider-retry
// shape). `provider-execution-engine`'s own fallback rename,
// `ExecutionRetryPolicy`, is *also* already taken (Sprint 35), so this
// sub-policy is renamed with a different disambiguator pulled straight
// from the brief's own "retry eligibility" language.
export type RetryEligibilityPolicy = {
  readonly maxAttempts: number
  readonly backoffStrategy: 'immediate' | 'fixed' | 'exponential'
}
