// "## Responsibilities" (§ brief) — the 5 named failure kinds (timeout
// failures, transient provider failures, rate limit failures,
// unavailable provider, retry exhaustion) plus a safe `'unknown'`
// default `FailureClassifier` falls back to.
export type FailureCategory = 'timeout' | 'transient-provider-failure' | 'rate-limit' | 'provider-unavailable' | 'retry-exhaustion' | 'unknown'
