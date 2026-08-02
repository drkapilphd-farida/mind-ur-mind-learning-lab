// "Empty recommendation sets, Duplicate recommendations, Invalid
// references, Ordering violations, Configuration compliance" — the
// Sprint 26 brief's own Section 5 list, verbatim.
export type RecommendationValidationIssueType =
  | 'empty-recommendation-set'
  | 'duplicate-recommendation'
  | 'invalid-reference'
  | 'ordering-violation'
  | 'configuration-violation'

// Immutable — every field `readonly`.
export type RecommendationValidationIssue = {
  readonly type: RecommendationValidationIssueType
  readonly itemId: string | null
  readonly detail: string
}
