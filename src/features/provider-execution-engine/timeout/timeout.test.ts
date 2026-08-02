import { describe, expect, it } from 'vitest'
import { decideTimeout } from './decideTimeout'

describe('decideTimeout', () => {
  it('reports timedOut: false with the remaining budget when elapsed is below the deadline', () => {
    const decision = decideTimeout(2000, { deadlineMs: 5000 })
    expect(decision).toEqual({ timedOut: false, remainingBudgetMs: 3000, reason: null })
  })

  it('reports timedOut: true with zero remaining budget once elapsed reaches the deadline', () => {
    const decision = decideTimeout(5000, { deadlineMs: 5000 })
    expect(decision.timedOut).toBe(true)
    expect(decision.remainingBudgetMs).toBe(0)
    expect(decision.reason).toBeTruthy()
  })

  it('reports timedOut: true and clamps remaining budget to 0 when elapsed exceeds the deadline', () => {
    const decision = decideTimeout(9000, { deadlineMs: 5000 })
    expect(decision.timedOut).toBe(true)
    expect(decision.remainingBudgetMs).toBe(0)
  })

  it('is deterministic — identical inputs produce an identical decision', () => {
    expect(decideTimeout(1000, { deadlineMs: 5000 })).toEqual(decideTimeout(1000, { deadlineMs: 5000 }))
  })
})
