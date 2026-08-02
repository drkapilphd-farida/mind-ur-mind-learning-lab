import { describe, expect, it } from 'vitest'
import { PROVIDER_ROLE_MAP } from './PROVIDER_ROLE_MAP'
import { buildTranslationInputs } from './buildTranslationInputs'
import { makeMentorPromptPayload } from '../testFixtures'

describe('PROVIDER_ROLE_MAP', () => {
  it('maps every ProviderMessageRole to the identical, valid AIRequestRole value', () => {
    expect(PROVIDER_ROLE_MAP).toEqual({ system: 'system', user: 'user', assistant: 'assistant' })
  })
})

describe('buildTranslationInputs', () => {
  it('looks up each of the 6 sections by type and passes instructions through', () => {
    const promptPayload = makeMentorPromptPayload({
      sections: [
        { type: 'system-context', values: ['response-1'] },
        { type: 'learner-context', values: ['active'] },
        { type: 'current-journey', values: ['journey-a'] },
        { type: 'recommendations', values: ['exercise:ex-1'] },
        { type: 'next-actions', values: ['review-exercise:ex-1'] },
        { type: 'metadata', values: ['2'] },
      ],
      instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    })

    const inputs = buildTranslationInputs({ learnerId: 'learner-1', profileId: 'profile-1', promptPayload, providerId: 'openai', configurationFacts: {} })

    expect(inputs).toEqual({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      systemContextValues: ['response-1'],
      learnerContextValues: ['active'],
      currentJourneyValues: ['journey-a'],
      recommendationValues: ['exercise:ex-1'],
      nextActionValues: ['review-exercise:ex-1'],
      metadataValues: ['2'],
      instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    })
  })

  it('defaults a missing section to an empty array', () => {
    const promptPayload = makeMentorPromptPayload({ sections: [] })
    const inputs = buildTranslationInputs({ learnerId: 'learner-1', profileId: 'profile-1', promptPayload, providerId: 'openai', configurationFacts: {} })
    expect(inputs.systemContextValues).toEqual([])
    expect(inputs.metadataValues).toEqual([])
  })
})
