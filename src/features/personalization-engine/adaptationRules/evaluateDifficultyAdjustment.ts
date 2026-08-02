import type { PersonalizationFacts } from '../domain'
import type { AdaptationResult } from '../adaptationDomain'

const RULE_ID = 'difficulty-adjustment'
const HIGH_ACCURACY_THRESHOLD = 0.85
const LOW_ACCURACY_THRESHOLD = 0.4

// Pure — "Difficulty adjustment." Reuses the `accuracy` fact key
// already established by Sprint 23's own tests/fixtures
// (`generatePersonalizationDecision.test.ts`).
export function evaluateDifficultyAdjustment(assessmentResults: PersonalizationFacts): AdaptationResult {
  const accuracy = assessmentResults.accuracy

  if (typeof accuracy === 'number' && accuracy >= HIGH_ACCURACY_THRESHOLD) {
    return {
      ruleId: RULE_ID,
      type: 'difficulty',
      value: 'increase-difficulty',
      applied: true,
      priority: 'high',
      reason: `Accuracy ${accuracy} met the high-performance threshold (>= ${HIGH_ACCURACY_THRESHOLD}).`,
    }
  }

  if (typeof accuracy === 'number' && accuracy <= LOW_ACCURACY_THRESHOLD) {
    return {
      ruleId: RULE_ID,
      type: 'difficulty',
      value: 'decrease-difficulty',
      applied: true,
      priority: 'high',
      reason: `Accuracy ${accuracy} fell at or below the low-performance threshold (<= ${LOW_ACCURACY_THRESHOLD}).`,
    }
  }

  return { ruleId: RULE_ID, type: 'difficulty', value: 'no-change', applied: false, priority: 'low', reason: 'Accuracy is within the acceptable range or unavailable.' }
}
