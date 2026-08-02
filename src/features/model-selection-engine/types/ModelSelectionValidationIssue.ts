// "## Validation" (§ brief), verbatim — the 6 named concerns.
export type ModelSelectionValidationIssueType =
  | 'unknown-model'
  | 'duplicate-model'
  | 'unsupported-capability'
  | 'invalid-configuration'
  | 'disabled-model'
  | 'empty-registry'

// Immutable — every field `readonly`.
export type ModelSelectionValidationIssue = {
  readonly type: ModelSelectionValidationIssueType
  readonly detail: string
}
