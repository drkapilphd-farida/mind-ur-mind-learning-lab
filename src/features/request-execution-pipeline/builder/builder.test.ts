import { describe, expect, it } from 'vitest'
import { createExecutionContextResolver } from '../context'
import { createRequestMetadataAssembler } from '../metadata'
import { createExecutionRequestBuilder } from './DefaultExecutionRequestBuilder'
import { makeFixedClock, makeRequestBuilderInputs, makeSequentialIdGenerator } from '../testFixtures'

describe('DefaultExecutionRequestBuilder (Request Building)', () => {
  it('assembles a full RequestEnvelope from raw inputs', () => {
    const builder = createExecutionRequestBuilder(
      makeSequentialIdGenerator('req'),
      createExecutionContextResolver(),
      createRequestMetadataAssembler(makeFixedClock('2026-01-01T00:00:00.000Z')),
    )

    const envelope = builder.build(
      makeRequestBuilderInputs({ learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', modelId: 'gpt-4o', systemPrompt: 'sys', userPrompt: 'usr' }),
    )

    expect(envelope).toEqual({
      id: 'req-1',
      context: { learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', modelId: 'gpt-4o' },
      payload: { systemPrompt: 'sys', userPrompt: 'usr' },
      metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'request-execution-pipeline', generatedAt: '2026-01-01T00:00:00.000Z' },
      configuration: { temperature: 0.7, maxOutputTokens: 1024 },
      safetyConfiguration: { moderationEnabled: true, blockedTerms: [] },
    })
  })

  it('does not validate — a blank input still produces an envelope', () => {
    const builder = createExecutionRequestBuilder(makeSequentialIdGenerator(), createExecutionContextResolver(), createRequestMetadataAssembler(makeFixedClock()))

    const envelope = builder.build(makeRequestBuilderInputs({ providerId: '', modelId: '', systemPrompt: '', userPrompt: '' }))

    expect(envelope.context.providerId).toBe('')
    expect(envelope.payload.userPrompt).toBe('')
  })
})
