// "Backoff Strategy, Immediate Retry" — the Sprint 35 brief's own
// Retry Engine list; `'immediate'` is its own strategy value, not a
// separate concept.
export type ExecutionBackoffStrategy = 'immediate' | 'fixed' | 'exponential'
