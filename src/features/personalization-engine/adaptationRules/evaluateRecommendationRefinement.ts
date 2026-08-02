import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { AdaptationResult } from '../adaptationDomain'

const RULE_ID = 'recommendation-refinement'
const LOW_PRIORITY_ITEM_THRESHOLD = 2

// Pure — "Recommendation refinement." Flags a recommendation set
// (Sprint 26) carrying at least `LOW_PRIORITY_ITEM_THRESHOLD` low-priority
// items.
export function evaluateRecommendationRefinement(recommendationSet: PersonalizationRecommendationSet): AdaptationResult {
  const lowPriorityCount = recommendationSet.groups.flatMap((group) => group.items).filter((item) => item.priority === 'low').length

  if (lowPriorityCount >= LOW_PRIORITY_ITEM_THRESHOLD) {
    return {
      ruleId: RULE_ID,
      type: 'recommendation-refinement',
      value: 'refine-recommendations',
      applied: true,
      priority: 'low',
      reason: `${lowPriorityCount} low-priority recommendations were found; refinement is suggested.`,
    }
  }

  return {
    ruleId: RULE_ID,
    type: 'recommendation-refinement',
    value: 'no-change',
    applied: false,
    priority: 'low',
    reason: 'Fewer than the threshold of low-priority recommendations were found.',
  }
}
