import type { ContextValidationIssue } from './ContextValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "package integrity" as a whole.
export type ContextValidationResult = {
  readonly valid: boolean
  readonly issues: readonly ContextValidationIssue[]
}
