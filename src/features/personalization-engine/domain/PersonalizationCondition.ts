import type { PersonalizationConditionOperator } from './PersonalizationConditionOperator'
import type { PersonalizationRuleInputType } from './PersonalizationRuleInputType'

// Immutable — every field `readonly`. `inputType` selects which
// `PersonalizationContext` facts bucket `factKey` is looked up in;
// `operator`/`value` define the comparison. One condition per rule —
// "Core Domain Foundation" deliberately keeps this simple (no AND/OR
// trees) rather than building a full expression language.
export type PersonalizationCondition = {
  readonly inputType: PersonalizationRuleInputType
  readonly factKey: string
  readonly operator: PersonalizationConditionOperator
  readonly value: string | number | boolean
}
