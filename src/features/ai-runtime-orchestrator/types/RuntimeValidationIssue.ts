// "## Validation" (§ brief), verbatim — the 8 named concerns.
export type RuntimeValidationIssueType =
  | 'missing-execution-context'
  | 'invalid-runtime-state'
  | 'missing-provider'
  | 'missing-model'
  | 'request-pipeline-failure'
  | 'provider-adapter-failure'
  | 'response-pipeline-failure'
  | 'invalid-final-result'

// Immutable — every field `readonly`.
export type RuntimeValidationIssue = {
  readonly type: RuntimeValidationIssueType
  readonly detail: string
}
