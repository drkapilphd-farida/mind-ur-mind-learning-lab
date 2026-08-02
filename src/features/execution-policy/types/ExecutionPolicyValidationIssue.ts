// "## Validation" (§ brief), verbatim — the 8 named concerns.
export type ExecutionPolicyValidationIssueType =
  | 'missing-policy'
  | 'invalid-timeout'
  | 'invalid-retry-count'
  | 'invalid-fallback'
  | 'invalid-constraint'
  | 'circular-fallback'
  | 'invalid-execution-state'
  | 'missing-diagnostics'

// Immutable — every field `readonly`.
export type ExecutionPolicyValidationIssue = {
  readonly type: ExecutionPolicyValidationIssueType
  readonly detail: string
}
