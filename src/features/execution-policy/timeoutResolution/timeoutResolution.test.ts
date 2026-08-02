import { describe, expect, it } from 'vitest'
import { resolveTimeout } from './resolveTimeout'
import { makeTimeoutResolutionPolicy } from '../testFixtures'

describe('resolveTimeout (Timeout Resolution)', () => {
  it('resolves the remaining budget when elapsed time is under the deadline', () => {
    const result = resolveTimeout(2000, makeTimeoutResolutionPolicy({ deadlineMs: 5000 }))
    expect(result).toEqual({ expired: false, remainingMs: 3000, reason: null })
  })

  it('resolves expired: true once elapsed time reaches the deadline', () => {
    const result = resolveTimeout(5000, makeTimeoutResolutionPolicy({ deadlineMs: 5000 }))
    expect(result.expired).toBe(true)
    expect(result.remainingMs).toBe(0)
    expect(result.reason).not.toBeNull()
  })

  it('never returns a negative remaining budget when elapsed exceeds the deadline', () => {
    const result = resolveTimeout(9000, makeTimeoutResolutionPolicy({ deadlineMs: 5000 }))
    expect(result.remainingMs).toBe(0)
  })
})
