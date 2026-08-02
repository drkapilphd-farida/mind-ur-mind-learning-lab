import type { PersonalizationCondition } from './PersonalizationCondition'
import type { PersonalizationOutcome } from './PersonalizationOutcome'

// Immutable — every field `readonly`. One deterministic condition ->
// outcome pair; a `PersonalizationProfile` composes any number of
// these.
export type PersonalizationRule = {
  readonly id: string
  readonly name: string
  readonly condition: PersonalizationCondition
  readonly outcome: PersonalizationOutcome
}
