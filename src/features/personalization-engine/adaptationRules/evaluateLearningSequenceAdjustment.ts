import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { AdaptationResult } from '../adaptationDomain'

const RULE_ID = 'learning-sequence-adjustment'

// Pure — "Learning sequence adjustment." Flags a missing/empty
// `journey` group in the recommendation set (Sprint 26).
export function evaluateLearningSequenceAdjustment(recommendationSet: PersonalizationRecommendationSet): AdaptationResult {
  const journeyGroup = recommendationSet.groups.find((group) => group.category === 'journey')

  if (!journeyGroup || journeyGroup.items.length === 0) {
    return {
      ruleId: RULE_ID,
      type: 'learning-sequence',
      value: 'revisit-learning-sequence',
      applied: true,
      priority: 'high',
      reason: 'No journey recommendation is present in the current recommendation set.',
    }
  }

  return { ruleId: RULE_ID, type: 'learning-sequence', value: 'no-change', applied: false, priority: 'low', reason: 'A journey recommendation is already present.' }
}
