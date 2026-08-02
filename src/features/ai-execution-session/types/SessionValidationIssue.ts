// "## Validation" (§ brief), verbatim — the 8 named concerns.
export type SessionValidationIssueType =
  | 'invalid-session-state'
  | 'missing-runtime-context'
  | 'duplicate-session-id'
  | 'invalid-transition'
  | 'missing-execution-result'
  | 'missing-response'
  | 'unexpected-failure'
  | 'invalid-completion'

// Immutable — every field `readonly`.
export type SessionValidationIssue = {
  readonly type: SessionValidationIssueType
  readonly detail: string
}
