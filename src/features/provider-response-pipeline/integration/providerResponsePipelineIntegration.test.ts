import { describe, expect, it } from 'vitest'
import { toTokenUsage } from './toTokenUsage'
import { buildResponseNormalizationInputs } from './buildResponseNormalizationInputs'
import { makeOpenAIRawResponse, makeProviderExecutionRequest } from '../testFixtures'

describe('toTokenUsage', () => {
  it('maps promptTokens/completionTokens/totalTokens to inputTokens/outputTokens/totalTokens', () => {
    expect(toTokenUsage({ promptTokens: 10, completionTokens: 5, totalTokens: 15 })).toEqual({ inputTokens: 10, outputTokens: 5, totalTokens: 15 })
  })
})

describe('buildResponseNormalizationInputs', () => {
  it('carries learnerId/profileId and passes the raw response through unchanged', () => {
    const executionRequest = makeProviderExecutionRequest({
      metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'provider-request-pipeline', generatedAt: '2026-01-01T00:00:00.000Z' },
    })
    const rawResponse = { providerId: 'openai' as const, response: makeOpenAIRawResponse() }

    const composition = buildResponseNormalizationInputs({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      executionRequest,
      rawResponse,
      configurationFacts: {},
    })

    expect(composition.normalizationInputs).toEqual({ learnerId: 'learner-1', profileId: 'profile-1' })
    expect(composition.rawResponse).toBe(rawResponse)
  })
})
