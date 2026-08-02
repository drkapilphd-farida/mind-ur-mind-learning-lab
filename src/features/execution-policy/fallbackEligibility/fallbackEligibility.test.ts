import { describe, expect, it } from 'vitest'
import { decideFallbackEligibility } from './decideFallbackEligibility'
import { makeExecutionPolicyRequest, makeFallbackEligibilityPolicy } from '../testFixtures'

describe('decideFallbackEligibility (Fallback Policy)', () => {
  it('is not eligible when fallback is not permitted', () => {
    const result = decideFallbackEligibility(makeExecutionPolicyRequest(), makeFallbackEligibilityPolicy({ allowFallback: false }))
    expect(result.eligible).toBe(false)
    expect(result.fallbackProviderId).toBeNull()
  })

  it('picks the first configured fallback id not equal to the current provider', () => {
    const request = makeExecutionPolicyRequest({ providerId: 'openai' })
    const policy = makeFallbackEligibilityPolicy({ fallbackProviderIds: ['anthropic', 'gemini'] })
    const result = decideFallbackEligibility(request, policy)
    expect(result).toEqual({ eligible: true, fallbackProviderId: 'anthropic', reason: expect.any(String) })
  })

  it('skips already-attempted fallback providers', () => {
    const request = makeExecutionPolicyRequest({ providerId: 'openai', attemptedProviderIds: ['anthropic'] })
    const policy = makeFallbackEligibilityPolicy({ fallbackProviderIds: ['anthropic', 'gemini'] })
    const result = decideFallbackEligibility(request, policy)
    expect(result.fallbackProviderId).toBe('gemini')
  })

  it('is not eligible when every configured fallback has already been attempted', () => {
    const request = makeExecutionPolicyRequest({ providerId: 'openai', attemptedProviderIds: ['anthropic', 'gemini'] })
    const policy = makeFallbackEligibilityPolicy({ fallbackProviderIds: ['anthropic', 'gemini'] })
    const result = decideFallbackEligibility(request, policy)
    expect(result.eligible).toBe(false)
  })
})
