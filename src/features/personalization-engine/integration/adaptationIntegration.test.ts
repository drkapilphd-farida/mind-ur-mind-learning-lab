import { describe, expect, it } from 'vitest'
import { buildAdaptationEvaluatorInputs } from './buildAdaptationEvaluatorInputs'
import { makeContextPackage, makeMemoryConfiguration, makePersonalizationProfile, makePersonalizationRecommendationSet } from '../testFixtures'

describe('buildAdaptationEvaluatorInputs', () => {
  it('composes the profile, recommendation set, and reduced facts', () => {
    const profile = makePersonalizationProfile()
    const recommendationSet = makePersonalizationRecommendationSet()
    const inputs = buildAdaptationEvaluatorInputs({
      learnerId: 'learner-1',
      profile,
      recommendationSet,
      assessmentResults: { accuracy: 0.9 },
      learningProgress: { streakDays: 5 },
      memoryContext: makeContextPackage(),
      configuration: makeMemoryConfiguration({ entries: [{ key: 'maxAppliedAdaptations', value: 2 }] }),
    })

    expect(inputs.profile).toBe(profile)
    expect(inputs.recommendationSet).toBe(recommendationSet)
    expect(inputs.assessmentResults).toEqual({ accuracy: 0.9 })
    expect(inputs.learningProgress).toEqual({ streakDays: 5 })
    expect(inputs.memoryFacts.sectionCount).toBe(1)
    expect(inputs.configurationFacts).toEqual({ maxAppliedAdaptations: 2 })
  })

  it('handles null memoryContext/configuration inputs', () => {
    const inputs = buildAdaptationEvaluatorInputs({
      learnerId: 'learner-1',
      profile: makePersonalizationProfile(),
      recommendationSet: makePersonalizationRecommendationSet(),
      assessmentResults: {},
      learningProgress: {},
      memoryContext: null,
      configuration: null,
    })

    expect(inputs.memoryFacts).toEqual({})
    expect(inputs.configurationFacts).toEqual({})
  })
})
