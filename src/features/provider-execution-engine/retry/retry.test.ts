import { describe, expect, it } from 'vitest'
import { decideRetry } from './decideRetry'

describe('decideRetry', () => {
  it('allows a retry when attemptCount is below maxAttempts', () => {
    const decision = decideRetry(1, { maxAttempts: 3, backoffStrategy: 'fixed' })
    expect(decision.shouldRetry).toBe(true)
    expect(decision.nextAttemptNumber).toBe(2)
    expect(decision.metadata).toEqual({ attemptCount: 1, maxAttempts: 3, backoffStrategy: 'fixed' })
  })

  it('rejects a retry once attemptCount reaches maxAttempts', () => {
    const decision = decideRetry(3, { maxAttempts: 3, backoffStrategy: 'fixed' })
    expect(decision.shouldRetry).toBe(false)
  })

  it('rejects a retry immediately when maxAttempts is 1', () => {
    const decision = decideRetry(1, { maxAttempts: 1, backoffStrategy: 'immediate' })
    expect(decision.shouldRetry).toBe(false)
  })

  it('is deterministic — identical inputs produce an identical decision', () => {
    const policy = { maxAttempts: 3, backoffStrategy: 'exponential' as const }
    expect(decideRetry(2, policy)).toEqual(decideRetry(2, policy))
  })
})
