import type { RuntimeValidationIssue } from './RuntimeValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper every
// validator in `../validation/` returns.
export type RuntimeValidation = {
  readonly valid: boolean
  readonly issues: readonly RuntimeValidationIssue[]
}
