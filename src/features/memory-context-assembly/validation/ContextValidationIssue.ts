// "Duplicate references, Invalid memory references, Empty packages,
// Ordering consistency, Configuration compliance" — the Sprint 21
// brief's own five named validation checks; unlike every earlier
// sprint's validation module, all five are explicit issue types here
// (the brief lists no separate "overall integrity" sixth item, so
// `ContextValidationResult.valid` — the aggregate — plays that role).
export type ContextValidationIssueType =
  | 'duplicate-reference'
  | 'invalid-reference'
  | 'empty-package'
  | 'ordering-violation'
  | 'configuration-violation'

// Immutable — every field `readonly`.
export type ContextValidationIssue = {
  readonly type: ContextValidationIssueType
  readonly detail: string
}
