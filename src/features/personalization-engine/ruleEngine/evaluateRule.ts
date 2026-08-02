import type { PersonalizationContext, PersonalizationRule } from '../domain'
import { evaluateCondition } from './evaluateCondition'

// Pure — a rule matches iff its one condition matches. "Core Domain
// Foundation" deliberately keeps this a 1:1 pass-through rather than a
// combinator over multiple conditions (see `PersonalizationCondition.ts`).
export function evaluateRule(rule: PersonalizationRule, context: PersonalizationContext): boolean {
  return evaluateCondition(rule.condition, context)
}
