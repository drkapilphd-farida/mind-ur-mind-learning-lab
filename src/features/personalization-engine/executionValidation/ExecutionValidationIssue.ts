// "Empty plans, Invalid references, Duplicate execution steps, Ordering
// violations, Configuration compliance" — the Sprint 25 brief's own
// Section 4 list, verbatim.
export type ExecutionValidationIssueType = 'empty-plan' | 'invalid-reference' | 'duplicate-step' | 'ordering-violation' | 'configuration-violation'

// Immutable — every field `readonly`.
export type ExecutionValidationIssue = {
  readonly type: ExecutionValidationIssueType
  readonly stepId: string | null
  readonly detail: string
}
