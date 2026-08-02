import { describe, expect, it } from 'vitest'
import { createExecutionPolicyEngine } from './DefaultExecutionPolicyEngine'
import { makeExecutionPolicyConfig, makeExecutionPolicyRequest } from '../testFixtures'

describe('DefaultExecutionPolicyEngine (Execution Decision)', () => {
  it('Execute: a fresh, well-formed request may proceed with the resolved remaining timeout', () => {
    const engine = createExecutionPolicyEngine(makeExecutionPolicyConfig({ timeoutPolicy: { deadlineMs: 5000 } }))

    const decision = engine.decide(makeExecutionPolicyRequest({ elapsedMs: 1000 }))

    expect(decision).toEqual({ decision: 'execute', reason: expect.any(String), fallbackProviderId: null, resolvedTimeoutMs: 4000 })
  })

  it('Retry: a failed previous attempt with retries remaining and no fallback configured', () => {
    const engine = createExecutionPolicyEngine(makeExecutionPolicyConfig({ fallbackPolicy: { allowFallback: false, fallbackProviderIds: [] } }))

    const decision = engine.decide(makeExecutionPolicyRequest({ previousProviderFailed: true, attemptCount: 1 }))

    expect(decision.decision).toBe('retry')
  })

  it('Cancel: a permitted manual cancellation request', () => {
    const engine = createExecutionPolicyEngine(makeExecutionPolicyConfig())

    const decision = engine.decide(makeExecutionPolicyRequest({ cancellationRequested: true, cancellationReason: 'manual' }))

    expect(decision).toEqual({ decision: 'cancel', reason: expect.any(String), fallbackProviderId: null, resolvedTimeoutMs: null })
  })

  it('Reject: an ineligible provider is rejected outright', () => {
    const engine = createExecutionPolicyEngine(makeExecutionPolicyConfig({ constraints: { eligibleProviderIds: ['anthropic'], maxConcurrentAttempts: 3, safetyModerationRequired: false } }))

    const decision = engine.decide(makeExecutionPolicyRequest({ providerId: 'openai' }))

    expect(decision.decision).toBe('reject')
  })

  it('Reject: retries exhausted with no fallback available', () => {
    const engine = createExecutionPolicyEngine(
      makeExecutionPolicyConfig({ retryPolicy: { maxAttempts: 1, backoffStrategy: 'fixed' }, fallbackPolicy: { allowFallback: false, fallbackProviderIds: [] } }),
    )

    const decision = engine.decide(makeExecutionPolicyRequest({ previousProviderFailed: true, attemptCount: 1 }))

    expect(decision).toEqual({ decision: 'reject', reason: expect.any(String), fallbackProviderId: null, resolvedTimeoutMs: null })
  })

  it('Fallback: a failed previous attempt with an untried fallback provider configured', () => {
    const engine = createExecutionPolicyEngine(makeExecutionPolicyConfig({ fallbackPolicy: { allowFallback: true, fallbackProviderIds: ['anthropic'] } }))

    const decision = engine.decide(makeExecutionPolicyRequest({ providerId: 'openai', previousProviderFailed: true }))

    expect(decision).toEqual({ decision: 'fallback', reason: expect.any(String), fallbackProviderId: 'anthropic', resolvedTimeoutMs: null })
  })

  it('Fallback: an expired timeout with no prior provider failure also triggers recovery', () => {
    const engine = createExecutionPolicyEngine(
      makeExecutionPolicyConfig({ timeoutPolicy: { deadlineMs: 5000 }, fallbackPolicy: { allowFallback: true, fallbackProviderIds: ['anthropic'] } }),
    )

    const decision = engine.decide(makeExecutionPolicyRequest({ providerId: 'openai', elapsedMs: 5000, previousProviderFailed: false }))

    expect(decision.decision).toBe('fallback')
  })

  it('Reject: an invalid execution state is rejected before any policy logic runs', () => {
    const engine = createExecutionPolicyEngine(makeExecutionPolicyConfig())

    const decision = engine.decide(makeExecutionPolicyRequest({ attemptCount: -1 }))

    expect(decision.decision).toBe('reject')
  })

  it('Deterministic Behavior / Policy Integrity: the same config and request always produce the same decision', () => {
    const config = makeExecutionPolicyConfig()
    const request = makeExecutionPolicyRequest({ elapsedMs: 1200 })

    const engineA = createExecutionPolicyEngine(config)
    const engineB = createExecutionPolicyEngine(config)

    expect(engineA.decide(request)).toEqual(engineB.decide(request))
  })
})
