// "Empty adaptations, Duplicate adaptations, Invalid profile
// references, Rule conflicts, Configuration compliance" — the Sprint 27
// brief's own Section 4 list, verbatim.
export type AdaptationValidationIssueType = 'empty-adaptation-set' | 'duplicate-adaptation' | 'invalid-profile-reference' | 'rule-conflict' | 'configuration-violation'

// Immutable — every field `readonly`.
export type AdaptationValidationIssue = {
  readonly type: AdaptationValidationIssueType
  readonly ruleId: string | null
  readonly detail: string
}
