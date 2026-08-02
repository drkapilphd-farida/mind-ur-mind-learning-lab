import type { ExecutionBackoffStrategy } from '../types'

// Immutable — every field `readonly`. "Retry Metadata" (§ Retry
// Engine).
export type RetryMetadata = {
  readonly attemptCount: number
  readonly maxAttempts: number
  readonly backoffStrategy: ExecutionBackoffStrategy
}
