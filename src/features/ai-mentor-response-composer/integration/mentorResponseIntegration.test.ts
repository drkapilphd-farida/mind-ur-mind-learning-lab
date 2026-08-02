import { describe, expect, it } from 'vitest'
import { buildResponseComposerInputs } from './buildResponseComposerInputs'
import { makeMentorPersonalizationContext, makePersonalizationExecutionPlan } from '../testFixtures'

describe('buildResponseComposerInputs', () => {
  it('reduces mentorContext and executionPlan into flat composer inputs', () => {
    const mentorContext = makeMentorPersonalizationContext({
      currentJourney: 'journey-a',
      learningState: { profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 2 },
      recommendations: { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }] },
    })
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [
        { type: 'review', steps: [{ id: 'r1', sequenceType: 'review', referenceId: 'daily', order: 0, priority: 'normal', detail: 'x' }] },
        { type: 'session', steps: [{ id: 's1', sequenceType: 'session', referenceId: '20', order: 0, priority: 'normal', detail: 'x' }] },
      ],
    })

    const inputs = buildResponseComposerInputs({ learnerId: 'learner-1', profileId: 'profile-1', mentorContext, executionPlan, configurationFacts: {} })

    expect(inputs).toEqual({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      currentJourney: 'journey-a',
      difficultyLevel: 'advanced',
      profileLifecycle: 'active',
      appliedAdaptationCount: 2,
      recommendationItems: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }],
      reviewReferenceIds: ['daily'],
      sessionReferenceIds: ['20'],
    })
  })

  it('defaults review/session reference ids to empty arrays when those sequences are absent', () => {
    const mentorContext = makeMentorPersonalizationContext()
    const executionPlan = makePersonalizationExecutionPlan({ sequences: [] })

    const inputs = buildResponseComposerInputs({ learnerId: 'learner-1', profileId: 'profile-1', mentorContext, executionPlan, configurationFacts: {} })

    expect(inputs.reviewReferenceIds).toEqual([])
    expect(inputs.sessionReferenceIds).toEqual([])
  })
})
