import type { PersonalizationContext, PersonalizationRule } from '../domain'

// "Implement deterministic evaluation. Supported inputs: Assessment
// Results, Learning Progress, Memory Context, Session Context,
// Configuration. No AI reasoning. No ML. No probability."
export interface PersonalizationRuleEngine {
  evaluate(rule: PersonalizationRule, context: PersonalizationContext): boolean
}
