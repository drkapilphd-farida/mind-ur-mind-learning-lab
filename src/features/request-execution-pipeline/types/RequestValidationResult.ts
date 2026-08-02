import type { RequestValidationIssue } from './RequestValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper
// `RequestValidator` returns.
export type RequestValidationResult = {
  readonly valid: boolean
  readonly issues: readonly RequestValidationIssue[]
}
