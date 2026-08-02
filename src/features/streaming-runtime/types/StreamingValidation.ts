import type { StreamingValidationIssue } from './StreamingValidationIssue'

// Immutable — the shared result wrapper every validator in `../validation/` returns.
export type StreamingValidation = {
  readonly valid: boolean
  readonly issues: readonly StreamingValidationIssue[]
}
