// "## Validation" (§ brief), verbatim — the 7 named concerns.
export type RequestValidationIssueType =
  | 'missing-provider'
  | 'missing-model'
  | 'invalid-prompt'
  | 'empty-payload'
  | 'invalid-metadata'
  | 'invalid-execution-context'
  | 'unsupported-configuration'

// Immutable — every field `readonly`.
export type RequestValidationIssue = {
  readonly type: RequestValidationIssueType
  readonly detail: string
}
