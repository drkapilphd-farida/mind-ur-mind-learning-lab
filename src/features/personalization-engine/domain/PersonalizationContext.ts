import type { PersonalizationFacts } from './PersonalizationFacts'

// Immutable — every field `readonly`. One flat `PersonalizationFacts`
// bucket per supported input category (`PersonalizationRuleInputType`)
// — the complete evaluation context a `PersonalizationRule` is checked
// against.
export type PersonalizationContext = {
  readonly assessmentResults: PersonalizationFacts
  readonly learningProgress: PersonalizationFacts
  readonly memoryContext: PersonalizationFacts
  readonly sessionContext: PersonalizationFacts
  readonly configuration: PersonalizationFacts
}
