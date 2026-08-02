// "Missing personalization, Missing execution plan, Missing
// recommendations, Duplicate references, Configuration compliance" —
// the Sprint 28 brief's own Section 3 list, verbatim.
export type MentorContextValidationIssueType =
  | 'missing-personalization'
  | 'missing-execution-plan'
  | 'missing-recommendations'
  | 'duplicate-reference'
  | 'configuration-violation'

// Immutable — every field `readonly`.
export type MentorContextValidationIssue = {
  readonly type: MentorContextValidationIssueType
  readonly referenceId: string | null
  readonly detail: string
}
