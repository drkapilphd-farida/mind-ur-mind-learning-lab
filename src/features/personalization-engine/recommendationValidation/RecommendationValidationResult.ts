import type { RecommendationValidationIssue } from './RecommendationValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "recommendation integrity" as a whole.
export type RecommendationValidationResult = {
  readonly valid: boolean
  readonly issues: readonly RecommendationValidationIssue[]
}
