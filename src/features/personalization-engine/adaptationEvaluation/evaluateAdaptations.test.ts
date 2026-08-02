import { describe, expect, it } from 'vitest'
import { evaluateAdaptations } from './evaluateAdaptations'
import { makeAdaptationEvaluatorInputs, makePersonalizationProfile } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('evaluateAdaptations', () => {
  it('produces exactly one result per fixed rule, in order', () => {
    const inputs = makeAdaptationEvaluatorInputs()
    const adaptation = evaluateAdaptations(inputs, NOW, 'adaptation-1')

    expect(adaptation.id).toBe('adaptation-1')
    expect(adaptation.version).toBe(1)
    expect(adaptation.profileId).toBe(inputs.profile.id)
    expect(adaptation.metadata).toEqual({ learnerId: inputs.learnerId, profileId: inputs.profile.id, source: 'adaptation-evaluator', generatedAt: NOW })
    expect(adaptation.results.map((result) => result.ruleId)).toEqual([
      'difficulty-adjustment',
      'review-frequency-adjustment',
      'session-length-adjustment',
      'learning-sequence-adjustment',
      'recommendation-refinement',
    ])
  })

  it('carries the profile id from the given profile, not just learnerId', () => {
    const inputs = makeAdaptationEvaluatorInputs({ profile: makePersonalizationProfile({ id: 'profile-xyz' }) })
    const adaptation = evaluateAdaptations(inputs, NOW, 'adaptation-1')
    expect(adaptation.profileId).toBe('profile-xyz')
    expect(adaptation.metadata.profileId).toBe('profile-xyz')
  })

  it('is deterministic — identical inputs produce an identical adaptation', () => {
    const inputs = makeAdaptationEvaluatorInputs()
    expect(evaluateAdaptations(inputs, NOW, 'adaptation-1')).toEqual(evaluateAdaptations(inputs, NOW, 'adaptation-1'))
  })
})
