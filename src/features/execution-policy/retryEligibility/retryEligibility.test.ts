import { describe, expect, it } from 'vitest'
import { decideRetryEligibility } from './decideRetryEligibility'
import { makeRetryEligibilityPolicy } from '../testFixtures'

describe('decideRetryEligibility (Retry Policy)', () => {
  it('is eligible when the attempt count is below the configured max', () => {
    const result = decideRetryEligibility(1, makeRetryEligibilityPolicy({ maxAttempts: 3 }))
    expect(result.eligible).toBe(true)
  })

  it('is not eligible once the attempt count reaches the configured max', () => {
    const result = decideRetryEligibility(3, makeRetryEligibilityPolicy({ maxAttempts: 3 }))
    expect(result.eligible).toBe(false)
  })
})
