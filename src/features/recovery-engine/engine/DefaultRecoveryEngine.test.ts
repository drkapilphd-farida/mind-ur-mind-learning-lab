import { describe, expect, it } from 'vitest'
import { createRecoveryEngine } from './DefaultRecoveryEngine'
import { makeBackoffPolicy, makeFailureSignal, makeRecoveryContext } from '../testFixtures'

describe('DefaultRecoveryEngine (Recovery Planning)', () => {
  it('plans a same-provider retry with a computed backoff delay for a transient failure', () => {
    const engine = createRecoveryEngine(makeBackoffPolicy({ strategy: 'fixed', baseDelayMs: 1000 }))

    const plan = engine.planRecovery(makeFailureSignal({ errorCode: 'transient_error' }), makeRecoveryContext({ attemptCount: 1, retryBudget: { maxAttempts: 3 } }))

    expect(plan.strategy).toBe('retry-same-provider')
    expect(plan.backoffDelayMs).toBe(1000)
    expect(plan.targetProviderId).toBeNull()
    expect(plan.targetModelId).toBeNull()
  })

  it('Fallback Triggering: plans execute-fallback with the configured fallback as the target', () => {
    const engine = createRecoveryEngine(makeBackoffPolicy())

    const plan = engine.planRecovery(
      makeFailureSignal({ errorCode: 'retry_exhausted' }),
      makeRecoveryContext({ fallbackProviderId: 'gemini' }),
    )

    expect(plan.strategy).toBe('execute-fallback')
    expect(plan.targetProviderId).toBe('gemini')
    expect(plan.backoffDelayMs).toBeNull()
  })

  it('plans retry-alternate-provider with the first alternate as the target for a rate-limit failure', () => {
    const engine = createRecoveryEngine(makeBackoffPolicy())

    const plan = engine.planRecovery(makeFailureSignal({ errorCode: 'rate_limited' }), makeRecoveryContext({ alternateProviderIds: ['anthropic', 'gemini'] }))

    expect(plan.strategy).toBe('retry-alternate-provider')
    expect(plan.targetProviderId).toBe('anthropic')
    expect(plan.backoffDelayMs).not.toBeNull()
  })

  it('Failure Classification integration: a timed-out signal is classified as timeout regardless of errorCode', () => {
    const engine = createRecoveryEngine(makeBackoffPolicy())

    const plan = engine.planRecovery(makeFailureSignal({ timedOut: true, errorCode: null }), makeRecoveryContext({ attemptCount: 1, retryBudget: { maxAttempts: 3 } }))

    expect(plan.strategy).toBe('retry-same-provider')
  })

  it('aborts and reports the validation reason when the input is invalid', () => {
    const engine = createRecoveryEngine(makeBackoffPolicy())

    const plan = engine.planRecovery(makeFailureSignal(), makeRecoveryContext({ providerId: '' }))

    expect(plan.strategy).toBe('abort-execution')
    expect(plan.reason).toContain('providerId')
  })

  it('aborts when the backoff policy itself is invalid', () => {
    const engine = createRecoveryEngine(makeBackoffPolicy({ baseDelayMs: 0 }))

    const plan = engine.planRecovery(makeFailureSignal(), makeRecoveryContext())

    expect(plan.strategy).toBe('abort-execution')
  })

  it('Deterministic Behavior: the same signal and context always produce the same plan', () => {
    const engineA = createRecoveryEngine(makeBackoffPolicy())
    const engineB = createRecoveryEngine(makeBackoffPolicy())
    const signal = makeFailureSignal({ errorCode: 'transient_error' })
    const context = makeRecoveryContext()

    expect(engineA.planRecovery(signal, context)).toEqual(engineB.planRecovery(signal, context))
  })
})
