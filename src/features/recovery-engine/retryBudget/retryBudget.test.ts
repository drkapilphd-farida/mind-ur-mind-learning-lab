import { describe, expect, it } from 'vitest'
import { evaluateRetryBudget } from './evaluateRetryBudget'
import { makeRetryBudget } from '../testFixtures'

describe('evaluateRetryBudget (Retry Budget)', () => {
  it('reports remaining attempts and exhausted: false when budget is not yet used up', () => {
    const result = evaluateRetryBudget(1, makeRetryBudget({ maxAttempts: 3 }))
    expect(result).toEqual({ remaining: 2, exhausted: false })
  })

  it('reports exhausted: true once attemptCount reaches maxAttempts', () => {
    const result = evaluateRetryBudget(3, makeRetryBudget({ maxAttempts: 3 }))
    expect(result).toEqual({ remaining: 0, exhausted: true })
  })

  it('never returns a negative remaining count', () => {
    const result = evaluateRetryBudget(5, makeRetryBudget({ maxAttempts: 3 }))
    expect(result.remaining).toBe(0)
  })
})
