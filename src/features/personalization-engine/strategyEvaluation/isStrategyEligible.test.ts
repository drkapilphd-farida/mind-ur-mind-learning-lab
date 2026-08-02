import { describe, expect, it } from 'vitest'
import { isStrategyEligible } from './isStrategyEligible'
import { makePersonalizationContext, makePersonalizationProfile, makePersonalizationStrategy } from '../testFixtures'

describe('isStrategyEligible', () => {
  it('is eligible for an active profile and no condition', () => {
    const inputs = { profile: makePersonalizationProfile({ lifecycle: 'active' }), decisions: [], context: makePersonalizationContext() }
    expect(isStrategyEligible(makePersonalizationStrategy({ condition: null }), inputs)).toBe(true)
  })

  it('is not eligible when the profile is not active', () => {
    const inputs = { profile: makePersonalizationProfile({ lifecycle: 'suspended' }), decisions: [], context: makePersonalizationContext() }
    expect(isStrategyEligible(makePersonalizationStrategy({ condition: null }), inputs)).toBe(false)
  })

  it('is eligible when a condition is given and matches the context', () => {
    const inputs = {
      profile: makePersonalizationProfile({ lifecycle: 'active' }),
      decisions: [],
      context: makePersonalizationContext({ assessmentResults: { accuracy: 0.9 } }),
    }
    const strategy = makePersonalizationStrategy({
      condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
    })
    expect(isStrategyEligible(strategy, inputs)).toBe(true)
  })

  it('is not eligible when a condition is given but does not match the context', () => {
    const inputs = {
      profile: makePersonalizationProfile({ lifecycle: 'active' }),
      decisions: [],
      context: makePersonalizationContext({ assessmentResults: { accuracy: 0.5 } }),
    }
    const strategy = makePersonalizationStrategy({
      condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
    })
    expect(isStrategyEligible(strategy, inputs)).toBe(false)
  })
})
