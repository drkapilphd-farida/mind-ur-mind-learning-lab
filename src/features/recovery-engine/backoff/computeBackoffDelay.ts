import type { BackoffPolicy } from '../types'

// Pure — "## Backoff" (§ brief): returns the delay that *would* apply
// — no real timers, no real waiting. `attemptCount` is 1-indexed (the
// first retry attempt).
export function computeBackoffDelay(attemptCount: number, policy: BackoffPolicy): number {
  const raw = (() => {
    switch (policy.strategy) {
      case 'immediate':
        return 0
      case 'fixed':
        return policy.baseDelayMs
      case 'linear':
        return policy.baseDelayMs * attemptCount
      case 'exponential':
        return policy.baseDelayMs * 2 ** (attemptCount - 1)
    }
  })()

  return Math.min(raw, policy.maxDelayMs)
}
