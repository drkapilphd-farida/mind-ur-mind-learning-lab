import { describe, expect, it } from 'vitest'
import { buildPromptAssemblyInputs } from './buildPromptAssemblyInputs'
import { makeMentorPersonalizationContext, makeMentorResponse } from '../testFixtures'

describe('buildPromptAssemblyInputs', () => {
  it('reduces mentorResponse and mentorContext into flat assembly inputs', () => {
    const mentorResponse = makeMentorResponse({
      id: 'response-1',
      metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'response-composer', generatedAt: '2026-01-01T00:00:00.000Z' },
      sections: [{ type: 'next-action', cards: [], actions: [{ id: 'action-ex-1', label: 'review-exercise', referenceId: 'ex-1' }] }],
    })
    const mentorContext = makeMentorPersonalizationContext({
      currentJourney: 'journey-a',
      recommendations: { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }] },
      learningState: { profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 2 },
      memoryReferences: [{ memoryId: 'assessment-0-0', summary: 'x' }],
    })

    const inputs = buildPromptAssemblyInputs({ learnerId: 'learner-1', profileId: 'profile-1', mentorResponse, mentorContext, configurationFacts: {} })

    expect(inputs).toEqual({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      sourceResponseId: 'response-1',
      responseSource: 'response-composer',
      profileLifecycle: 'active',
      currentJourney: 'journey-a',
      difficultyLevel: 'advanced',
      recommendationValues: ['exercise:ex-1'],
      nextActionValues: ['review-exercise:ex-1'],
      memoryReferenceIds: ['assessment-0-0'],
      appliedAdaptationCount: 2,
    })
  })

  it('defaults nextActionValues to an empty array when the response has no next-action section', () => {
    const mentorResponse = makeMentorResponse({ sections: [] })
    const mentorContext = makeMentorPersonalizationContext()

    const inputs = buildPromptAssemblyInputs({ learnerId: 'learner-1', profileId: 'profile-1', mentorResponse, mentorContext, configurationFacts: {} })

    expect(inputs.nextActionValues).toEqual([])
  })
})
