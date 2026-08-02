import type { AdaptationValidationIssue } from './AdaptationValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "adaptation integrity" as a whole.
export type AdaptationValidationResult = {
  readonly valid: boolean
  readonly issues: readonly AdaptationValidationIssue[]
}
