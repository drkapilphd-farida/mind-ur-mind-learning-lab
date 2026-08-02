// "## Validation" (§ brief), verbatim — the 7 named concerns. Named
// `ResponseProcessingValidationIssue` (not "ResponseValidationIssue")
// to sidestep a real, exact collision with the pre-existing
// `provider-response-pipeline/validation/ResponseValidationIssue.ts`.
export type ResponseProcessingValidationIssueType =
  | 'empty-response'
  | 'invalid-response'
  | 'missing-content'
  | 'invalid-metadata'
  | 'missing-usage'
  | 'unsupported-finish-reason'
  | 'provider-error-payload'

// Immutable — every field `readonly`.
export type ResponseProcessingValidationIssue = {
  readonly type: ResponseProcessingValidationIssueType
  readonly detail: string
}
