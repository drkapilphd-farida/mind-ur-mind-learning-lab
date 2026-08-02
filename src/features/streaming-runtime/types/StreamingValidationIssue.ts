// "## Validation" (§ brief), verbatim — the 8 named concerns. Zero collisions
// found for any supporting validation type name during collision research.
export type StreamingValidationIssueType =
  | 'invalid-chunk-sequence'
  | 'duplicate-chunk'
  | 'missing-chunk'
  | 'invalid-completion'
  | 'buffer-overflow'
  | 'invalid-stream-state'
  | 'invalid-lifecycle-transition'
  | 'missing-diagnostics'

// Immutable — every field `readonly`, same shape as every other validation
// issue type across the arc (e.g. `SessionValidationIssue`).
export type StreamingValidationIssue = {
  readonly type: StreamingValidationIssueType
  readonly detail: string
}
