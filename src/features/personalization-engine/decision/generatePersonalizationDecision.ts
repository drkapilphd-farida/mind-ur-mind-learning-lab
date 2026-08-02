import type { PersonalizationContext, PersonalizationDecision, PersonalizationProfile } from '../domain'
import { evaluateRule } from '../ruleEngine'

// Pure — "Produce immutable decisions." Evaluates every rule on the
// profile against the given context; each matching rule contributes
// exactly one recommendation, in the profile's own rule order
// (deterministic — no scoring, no ranking).
export function generatePersonalizationDecision(
  profile: PersonalizationProfile,
  context: PersonalizationContext,
  now: string,
  id: string,
): PersonalizationDecision {
  const recommendations = profile.rules
    .filter((rule) => evaluateRule(rule, context))
    .map((rule) => ({
      decisionType: rule.outcome.decisionType,
      value: rule.outcome.value,
      matchedRuleId: rule.id,
      reason: `Matched rule "${rule.name}"`,
    }))

  return { id, profileId: profile.id, recommendations, generatedAt: now }
}
