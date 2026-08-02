import type { PersonalizationFacts } from '../domain'
import type { AdaptationResult } from '../adaptationDomain'

const RULE_ID = 'review-frequency-adjustment'
const HIGH_STREAK_THRESHOLD = 7
const LOW_STREAK_THRESHOLD = 3

// Pure — "Review frequency adjustment." Reuses the `streakDays` fact
// key already established by Sprint 23's own tests/fixtures
// (`DefaultPersonalizationService.test.ts`).
export function evaluateReviewFrequencyAdjustment(learningProgress: PersonalizationFacts): AdaptationResult {
  const streakDays = learningProgress.streakDays

  if (typeof streakDays === 'number' && streakDays >= HIGH_STREAK_THRESHOLD) {
    return {
      ruleId: RULE_ID,
      type: 'review-frequency',
      value: 'decrease-review-frequency',
      applied: true,
      priority: 'normal',
      reason: `Streak of ${streakDays} days indicates strong retention.`,
    }
  }

  if (typeof streakDays === 'number' && streakDays < LOW_STREAK_THRESHOLD) {
    return {
      ruleId: RULE_ID,
      type: 'review-frequency',
      value: 'increase-review-frequency',
      applied: true,
      priority: 'normal',
      reason: `Streak of ${streakDays} days is below the retention threshold (${LOW_STREAK_THRESHOLD}).`,
    }
  }

  return { ruleId: RULE_ID, type: 'review-frequency', value: 'no-change', applied: false, priority: 'low', reason: 'Learning progress streak is within the acceptable range or unavailable.' }
}
