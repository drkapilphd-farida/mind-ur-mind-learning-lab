import type { PersonalizationContext, PersonalizationRule } from '../domain'
import { evaluateRule } from './evaluateRule'
import type { PersonalizationRuleEngine } from './PersonalizationRuleEngine'

// Implements PersonalizationRuleEngine — a thin, stateless wrapper
// around the pure `evaluateRule` function.
export class DefaultPersonalizationRuleEngine implements PersonalizationRuleEngine {
  evaluate(rule: PersonalizationRule, context: PersonalizationContext): boolean {
    return evaluateRule(rule, context)
  }
}

export function createPersonalizationRuleEngine(): PersonalizationRuleEngine {
  return new DefaultPersonalizationRuleEngine()
}
