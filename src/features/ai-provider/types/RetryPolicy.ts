export type RetryBackoffStrategy = 'fixed' | 'exponential'

export type RetryPolicy = {
  maxAttempts: number
  backoffStrategy: RetryBackoffStrategy
  baseDelayMs: number
}
