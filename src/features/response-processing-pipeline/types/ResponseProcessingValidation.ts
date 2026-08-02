import type { ResponseProcessingValidationIssue } from './ResponseProcessingValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper
// `ResponseValidator` returns — named to sidestep a real, exact
// collision with the pre-existing
// `provider-response-pipeline/validation/ResponseValidationResult.ts`.
export type ResponseProcessingValidation = {
  readonly valid: boolean
  readonly issues: readonly ResponseProcessingValidationIssue[]
}
