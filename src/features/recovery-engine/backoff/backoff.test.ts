import { describe, expect, it } from 'vitest'
import { computeBackoffDelay } from './computeBackoffDelay'
import { makeBackoffPolicy } from '../testFixtures'

describe('computeBackoffDelay (Backoff Behavior)', () => {
  it('immediate always returns 0', () => {
    expect(computeBackoffDelay(1, makeBackoffPolicy({ strategy: 'immediate' }))).toBe(0)
    expect(computeBackoffDelay(3, makeBackoffPolicy({ strategy: 'immediate' }))).toBe(0)
  })

  it('fixed always returns baseDelayMs regardless of attempt count', () => {
    expect(computeBackoffDelay(1, makeBackoffPolicy({ strategy: 'fixed', baseDelayMs: 1000 }))).toBe(1000)
    expect(computeBackoffDelay(5, makeBackoffPolicy({ strategy: 'fixed', baseDelayMs: 1000 }))).toBe(1000)
  })

  it('linear scales delay proportionally to attempt count', () => {
    const policy = makeBackoffPolicy({ strategy: 'linear', baseDelayMs: 1000, maxDelayMs: 30000 })
    expect(computeBackoffDelay(1, policy)).toBe(1000)
    expect(computeBackoffDelay(3, policy)).toBe(3000)
  })

  it('exponential doubles delay per attempt', () => {
    const policy = makeBackoffPolicy({ strategy: 'exponential', baseDelayMs: 1000, maxDelayMs: 30000 })
    expect(computeBackoffDelay(1, policy)).toBe(1000)
    expect(computeBackoffDelay(2, policy)).toBe(2000)
    expect(computeBackoffDelay(3, policy)).toBe(4000)
  })

  it('caps the computed delay at maxDelayMs', () => {
    const policy = makeBackoffPolicy({ strategy: 'exponential', baseDelayMs: 1000, maxDelayMs: 5000 })
    expect(computeBackoffDelay(10, policy)).toBe(5000)
  })
})
