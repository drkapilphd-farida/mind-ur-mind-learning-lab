import type { ResponseValidationIssue } from './ResponseValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Provider response integrity" as a whole.
export type ResponseValidationResult = {
  readonly valid: boolean
  readonly issues: readonly ResponseValidationIssue[]
}
