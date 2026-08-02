import type { SessionValidationIssue } from './SessionValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper every
// validator in `../validation/` returns.
export type SessionValidation = {
  readonly valid: boolean
  readonly issues: readonly SessionValidationIssue[]
}
