import type { RecoveryValidationIssue } from './RecoveryValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper every
// validator in `../validation/` returns.
export type RecoveryValidation = {
  readonly valid: boolean
  readonly issues: readonly RecoveryValidationIssue[]
}
