import { describe, expect, it } from 'vitest'
import { toAIRequestOptions } from './toAIRequestOptions'
import { buildPipelineInputs } from './buildPipelineInputs'
import { makeProviderRequest } from '../testFixtures'

describe('toAIRequestOptions', () => {
  it('maps temperature and maxOutputTokens through unchanged', () => {
    expect(toAIRequestOptions({ temperature: 0.5, maxOutputTokens: 512 })).toEqual({ temperature: 0.5, maxOutputTokens: 512 })
  })
})

describe('buildPipelineInputs', () => {
  it('reduces a ProviderRequest into flat pipeline inputs', () => {
    const providerRequest = makeProviderRequest({
      providerId: 'anthropic',
      version: 1,
      context: { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active'] },
      messages: [{ role: 'user', content: 'x' }],
      instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    })

    const inputs = buildPipelineInputs({ learnerId: 'learner-1', profileId: 'profile-1', providerRequest, configurationFacts: {} })

    expect(inputs).toEqual({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      providerId: 'anthropic',
      sourceVersion: 1,
      facts: ['active'],
      messages: [{ role: 'user', content: 'x' }],
      instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    })
  })
})
