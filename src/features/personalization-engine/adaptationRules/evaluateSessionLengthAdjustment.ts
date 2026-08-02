import type { PersonalizationFacts } from '../domain'
import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { AdaptationResult } from '../adaptationDomain'

const RULE_ID = 'session-length-adjustment'
const DRIFT_THRESHOLD_MINUTES = 10

// Pure — "Session length adjustment." Compares the recommendation
// set's own `session` group item (Sprint 26 — `referenceId` is a
// stringified minutes value, per Sprint 25's `sequenceSessionGrouping`)
// against a `targetSessionDurationMinutes` configuration fact.
export function evaluateSessionLengthAdjustment(recommendationSet: PersonalizationRecommendationSet, configurationFacts: PersonalizationFacts): AdaptationResult {
  const targetMinutes = configurationFacts.targetSessionDurationMinutes
  const sessionItem = recommendationSet.groups.find((group) => group.category === 'session')?.items[0]
  const currentMinutes = sessionItem ? Number(sessionItem.referenceId) : Number.NaN

  if (typeof targetMinutes === 'number' && !Number.isNaN(currentMinutes) && Math.abs(currentMinutes - targetMinutes) >= DRIFT_THRESHOLD_MINUTES) {
    return {
      ruleId: RULE_ID,
      type: 'session-length',
      value: 'align-session-length',
      applied: true,
      priority: 'normal',
      reason: `Current session length ${currentMinutes} differs from the configured target ${targetMinutes} by at least ${DRIFT_THRESHOLD_MINUTES} minutes.`,
    }
  }

  return {
    ruleId: RULE_ID,
    type: 'session-length',
    value: 'no-change',
    applied: false,
    priority: 'low',
    reason: 'No session recommendation or configured target is available, or they are already aligned.',
  }
}
