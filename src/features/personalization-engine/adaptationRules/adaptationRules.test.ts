import { describe, expect, it } from 'vitest'
import { evaluateDifficultyAdjustment } from './evaluateDifficultyAdjustment'
import { evaluateReviewFrequencyAdjustment } from './evaluateReviewFrequencyAdjustment'
import { evaluateSessionLengthAdjustment } from './evaluateSessionLengthAdjustment'
import { evaluateLearningSequenceAdjustment } from './evaluateLearningSequenceAdjustment'
import { evaluateRecommendationRefinement } from './evaluateRecommendationRefinement'
import { makePersonalizationRecommendationSet, makeRecommendationGroup, makeRecommendationItem } from '../testFixtures'

describe('evaluateDifficultyAdjustment', () => {
  it('applies increase-difficulty when accuracy meets the high threshold', () => {
    const result = evaluateDifficultyAdjustment({ accuracy: 0.9 })
    expect(result).toEqual({ ruleId: 'difficulty-adjustment', type: 'difficulty', value: 'increase-difficulty', applied: true, priority: 'high', reason: expect.any(String) })
  })

  it('applies decrease-difficulty when accuracy meets the low threshold', () => {
    const result = evaluateDifficultyAdjustment({ accuracy: 0.2 })
    expect(result.applied).toBe(true)
    expect(result.value).toBe('decrease-difficulty')
  })

  it('is rejected when accuracy is within the acceptable range', () => {
    const result = evaluateDifficultyAdjustment({ accuracy: 0.6 })
    expect(result).toEqual({ ruleId: 'difficulty-adjustment', type: 'difficulty', value: 'no-change', applied: false, priority: 'low', reason: expect.any(String) })
  })

  it('is rejected when accuracy is unavailable', () => {
    expect(evaluateDifficultyAdjustment({}).applied).toBe(false)
  })
})

describe('evaluateReviewFrequencyAdjustment', () => {
  it('applies decrease-review-frequency for a strong streak', () => {
    const result = evaluateReviewFrequencyAdjustment({ streakDays: 10 })
    expect(result.applied).toBe(true)
    expect(result.value).toBe('decrease-review-frequency')
  })

  it('applies increase-review-frequency for a weak streak', () => {
    const result = evaluateReviewFrequencyAdjustment({ streakDays: 1 })
    expect(result.applied).toBe(true)
    expect(result.value).toBe('increase-review-frequency')
  })

  it('is rejected when streak is within the acceptable range or unavailable', () => {
    expect(evaluateReviewFrequencyAdjustment({ streakDays: 5 }).applied).toBe(false)
    expect(evaluateReviewFrequencyAdjustment({}).applied).toBe(false)
  })
})

describe('evaluateSessionLengthAdjustment', () => {
  it('applies align-session-length when current and target drift by at least the threshold', () => {
    const recommendationSet = makePersonalizationRecommendationSet({
      groups: [makeRecommendationGroup({ category: 'session', items: [makeRecommendationItem({ category: 'session', referenceId: '20' })] })],
    })
    const result = evaluateSessionLengthAdjustment(recommendationSet, { targetSessionDurationMinutes: 45 })
    expect(result.applied).toBe(true)
    expect(result.value).toBe('align-session-length')
  })

  it('is rejected when current and target are already aligned', () => {
    const recommendationSet = makePersonalizationRecommendationSet({
      groups: [makeRecommendationGroup({ category: 'session', items: [makeRecommendationItem({ category: 'session', referenceId: '20' })] })],
    })
    expect(evaluateSessionLengthAdjustment(recommendationSet, { targetSessionDurationMinutes: 25 }).applied).toBe(false)
  })

  it('is rejected when there is no session recommendation or no configured target', () => {
    const recommendationSet = makePersonalizationRecommendationSet({ groups: [] })
    expect(evaluateSessionLengthAdjustment(recommendationSet, { targetSessionDurationMinutes: 45 }).applied).toBe(false)
    expect(evaluateSessionLengthAdjustment(recommendationSet, {}).applied).toBe(false)
  })
})

describe('evaluateLearningSequenceAdjustment', () => {
  it('applies revisit-learning-sequence when there is no journey group', () => {
    const recommendationSet = makePersonalizationRecommendationSet({ groups: [makeRecommendationGroup({ category: 'exercise' })] })
    const result = evaluateLearningSequenceAdjustment(recommendationSet)
    expect(result.applied).toBe(true)
    expect(result.value).toBe('revisit-learning-sequence')
  })

  it('is rejected when a journey recommendation is present', () => {
    const recommendationSet = makePersonalizationRecommendationSet({ groups: [makeRecommendationGroup({ category: 'journey' })] })
    expect(evaluateLearningSequenceAdjustment(recommendationSet).applied).toBe(false)
  })
})

describe('evaluateRecommendationRefinement', () => {
  it('applies refine-recommendations when at least 2 low-priority items exist', () => {
    const recommendationSet = makePersonalizationRecommendationSet({
      groups: [
        makeRecommendationGroup({
          items: [makeRecommendationItem({ id: 'a', priority: 'low' }), makeRecommendationItem({ id: 'b', priority: 'low' })],
        }),
      ],
    })
    const result = evaluateRecommendationRefinement(recommendationSet)
    expect(result.applied).toBe(true)
    expect(result.value).toBe('refine-recommendations')
  })

  it('is rejected when fewer than 2 low-priority items exist', () => {
    const recommendationSet = makePersonalizationRecommendationSet({
      groups: [makeRecommendationGroup({ items: [makeRecommendationItem({ priority: 'high' })] })],
    })
    expect(evaluateRecommendationRefinement(recommendationSet).applied).toBe(false)
  })
})
