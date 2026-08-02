import { describe, expect, it } from 'vitest'
import { createRetryDecisionResolver } from './DefaultRetryDecisionResolver'
import { makeRecoveryContext } from '../testFixtures'

describe('DefaultRetryDecisionResolver (Recovery Strategies)', () => {
  const resolver = createRetryDecisionResolver()

  it('Retry Same Provider: a transient failure with budget remaining', () => {
    const context = makeRecoveryContext({ attemptCount: 1, retryBudget: { maxAttempts: 3 } })
    expect(resolver.resolve('transient-provider-failure', context)).toBe('retry-same-provider')
  })

  it('Retry Alternate Model: a timeout with budget exhausted but an alternate model available', () => {
    const context = makeRecoveryContext({ attemptCount: 3, retryBudget: { maxAttempts: 3 }, alternateModelIds: ['gpt-4o-mini'] })
    expect(resolver.resolve('timeout', context)).toBe('retry-alternate-model')
  })

  it('Retry Alternate Provider: a rate-limit failure with an alternate provider available', () => {
    const context = makeRecoveryContext({ alternateProviderIds: ['anthropic'] })
    expect(resolver.resolve('rate-limit', context)).toBe('retry-alternate-provider')
  })

  it('Retry Alternate Provider: a provider-unavailable failure also prefers an alternate provider', () => {
    const context = makeRecoveryContext({ alternateProviderIds: ['anthropic'] })
    expect(resolver.resolve('provider-unavailable', context)).toBe('retry-alternate-provider')
  })

  it('Execute Fallback: budget exhausted, no alternate model, but a fallback provider is configured', () => {
    const context = makeRecoveryContext({ attemptCount: 3, retryBudget: { maxAttempts: 3 }, alternateModelIds: [], fallbackProviderId: 'gemini' })
    expect(resolver.resolve('timeout', context)).toBe('execute-fallback')
  })

  it('Execute Fallback: retry-exhaustion always prefers fallback when available', () => {
    const context = makeRecoveryContext({ fallbackProviderId: 'gemini' })
    expect(resolver.resolve('retry-exhaustion', context)).toBe('execute-fallback')
  })

  it('Abort Execution: retry-exhaustion with no fallback available', () => {
    const context = makeRecoveryContext({ fallbackProviderId: null })
    expect(resolver.resolve('retry-exhaustion', context)).toBe('abort-execution')
  })

  it('Abort Execution: an unknown failure category always aborts', () => {
    const context = makeRecoveryContext({ alternateProviderIds: ['anthropic'], fallbackProviderId: 'gemini' })
    expect(resolver.resolve('unknown', context)).toBe('abort-execution')
  })

  it('Abort Execution: every recovery avenue exhausted', () => {
    const context = makeRecoveryContext({
      attemptCount: 3,
      retryBudget: { maxAttempts: 3 },
      alternateModelIds: [],
      alternateProviderIds: [],
      fallbackProviderId: null,
    })
    expect(resolver.resolve('timeout', context)).toBe('abort-execution')
  })
})
