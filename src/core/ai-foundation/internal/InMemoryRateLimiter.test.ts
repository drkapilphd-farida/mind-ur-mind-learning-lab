import { describe, expect, it } from 'vitest'
import type { RateLimitPolicy } from '../types'
import { createInMemoryRateLimiter } from './InMemoryRateLimiter'

const POLICY: RateLimitPolicy = { maxRequestsPerMinute: 2, maxTokensPerMinute: 1000 }

describe('InMemoryRateLimiter', () => {
  it('allows requests under both limits', () => {
    const limiter = createInMemoryRateLimiter(POLICY)
    expect(limiter.tryAcquire(100)).toEqual({ allowed: true })
  })

  it('denies once maxRequestsPerMinute is reached within the window', () => {
    const limiter = createInMemoryRateLimiter(POLICY)
    expect(limiter.tryAcquire(10).allowed).toBe(true)
    expect(limiter.tryAcquire(10).allowed).toBe(true)
    const third = limiter.tryAcquire(10)
    expect(third.allowed).toBe(false)
    expect(third.allowed === false && third.reason).toContain('Request rate limit exceeded')
  })

  it('denies once maxTokensPerMinute would be exceeded', () => {
    const limiter = createInMemoryRateLimiter({ maxRequestsPerMinute: 100, maxTokensPerMinute: 500 })
    expect(limiter.tryAcquire(400).allowed).toBe(true)
    const second = limiter.tryAcquire(200)
    expect(second.allowed).toBe(false)
    expect(second.allowed === false && second.reason).toContain('Token rate limit exceeded')
  })

  it('frees capacity once entries age out of the 60s window', () => {
    let currentTime = new Date('2026-01-01T00:00:00.000Z')
    const limiter = createInMemoryRateLimiter(POLICY, { now: () => currentTime })

    expect(limiter.tryAcquire(10).allowed).toBe(true)
    expect(limiter.tryAcquire(10).allowed).toBe(true)
    expect(limiter.tryAcquire(10).allowed).toBe(false)

    currentTime = new Date('2026-01-01T00:01:00.001Z')
    expect(limiter.tryAcquire(10).allowed).toBe(true)
  })

  it('returns a positive retryAfterMs when denied', () => {
    let currentTime = new Date('2026-01-01T00:00:00.000Z')
    const limiter = createInMemoryRateLimiter({ maxRequestsPerMinute: 1, maxTokensPerMinute: 1000 }, { now: () => currentTime })

    limiter.tryAcquire(10)
    currentTime = new Date('2026-01-01T00:00:10.000Z')
    const decision = limiter.tryAcquire(10)
    expect(decision.allowed).toBe(false)
    expect(decision.allowed === false && decision.retryAfterMs).toBe(50_000)
  })
})
