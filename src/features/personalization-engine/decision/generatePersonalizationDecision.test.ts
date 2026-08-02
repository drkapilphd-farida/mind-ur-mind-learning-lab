import { describe, expect, it } from 'vitest'
import { generatePersonalizationDecision } from './generatePersonalizationDecision'
import { makePersonalizationContext, makePersonalizationProfile, makePersonalizationRule } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('generatePersonalizationDecision', () => {
  it('produces one recommendation per matching rule, in rule order', () => {
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.9 }, learningProgress: { streakDays: 10 } })
    const profile = makePersonalizationProfile({
      rules: [
        makePersonalizationRule({
          id: 'r1',
          name: 'High accuracy',
          condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
          outcome: { decisionType: 'difficulty', value: 'advanced' },
        }),
        makePersonalizationRule({
          id: 'r2',
          name: 'Long streak',
          condition: { inputType: 'learning-progress', factKey: 'streakDays', operator: 'greater-than', value: 5 },
          outcome: { decisionType: 'review-frequency', value: 'weekly' },
        }),
      ],
    })

    const decision = generatePersonalizationDecision(profile, context, NOW, 'decision-1')
    expect(decision.id).toBe('decision-1')
    expect(decision.profileId).toBe(profile.id)
    expect(decision.generatedAt).toBe(NOW)
    expect(decision.recommendations).toEqual([
      { decisionType: 'difficulty', value: 'advanced', matchedRuleId: 'r1', reason: 'Matched rule "High accuracy"' },
      { decisionType: 'review-frequency', value: 'weekly', matchedRuleId: 'r2', reason: 'Matched rule "Long streak"' },
    ])
  })

  it('excludes non-matching rules', () => {
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.5 } })
    const profile = makePersonalizationProfile({
      rules: [
        makePersonalizationRule({
          condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
        }),
      ],
    })
    const decision = generatePersonalizationDecision(profile, context, NOW, 'decision-1')
    expect(decision.recommendations).toEqual([])
  })

  it('produces an empty recommendations list for a profile with no rules', () => {
    const profile = makePersonalizationProfile({ rules: [] })
    const decision = generatePersonalizationDecision(profile, makePersonalizationContext(), NOW, 'decision-1')
    expect(decision.recommendations).toEqual([])
  })
})
