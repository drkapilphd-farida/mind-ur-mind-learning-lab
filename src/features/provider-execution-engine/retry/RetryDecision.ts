import type { RetryMetadata } from './RetryMetadata'

// Immutable — every field `readonly`. "Retry Decision" (§ Retry
// Engine) — the outcome of `decideRetry.ts`, always carrying its own
// `RetryMetadata` alongside it.
export type RetryDecision = {
  readonly shouldRetry: boolean
  readonly nextAttemptNumber: number
  readonly reason: string
  readonly metadata: RetryMetadata
}
