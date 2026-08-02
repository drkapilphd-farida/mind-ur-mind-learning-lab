// "## Validation" (§ brief), verbatim — the 7 named concerns.
export type RecoveryValidationIssueType =
  | 'invalid-retry-policy'
  | 'invalid-backoff'
  | 'retry-budget-exceeded'
  | 'circular-recovery'
  | 'invalid-recovery-strategy'
  | 'missing-diagnostics'
  | 'invalid-execution-state'

// Immutable — every field `readonly`.
export type RecoveryValidationIssue = {
  readonly type: RecoveryValidationIssueType
  readonly detail: string
}
