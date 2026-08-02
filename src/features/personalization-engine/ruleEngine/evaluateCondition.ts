import type { PersonalizationCondition, PersonalizationContext } from '../domain'
import { getFactsForInputType } from './getFactsForInputType'

// Pure — "Implement deterministic evaluation... No AI reasoning. No
// ML. No probability." A fact that's missing from its bucket is
// treated as `undefined`, which never satisfies any operator (no
// operator branch below matches `undefined`), so a rule referencing an
// absent fact simply doesn't match — never throws, never guesses.
export function evaluateCondition(condition: PersonalizationCondition, context: PersonalizationContext): boolean {
  const facts = getFactsForInputType(context, condition.inputType)
  const factValue = facts[condition.factKey]

  switch (condition.operator) {
    case 'equals':
      return factValue === condition.value
    case 'greater-than':
      return typeof factValue === 'number' && typeof condition.value === 'number' && factValue > condition.value
    case 'less-than':
      return typeof factValue === 'number' && typeof condition.value === 'number' && factValue < condition.value
    case 'contains':
      return typeof factValue === 'string' && typeof condition.value === 'string' && factValue.includes(condition.value)
  }
}
