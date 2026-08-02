import type { PersonalizationDecisionType } from './PersonalizationDecisionType'

// Immutable — every field `readonly`. What a rule recommends when its
// condition matches — a plain data value, never anything executable.
export type PersonalizationOutcome = {
  readonly decisionType: PersonalizationDecisionType
  readonly value: string
}
