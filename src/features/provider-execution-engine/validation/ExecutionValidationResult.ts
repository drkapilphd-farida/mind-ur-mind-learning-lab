import type { ExecutionValidationIssue } from './ExecutionValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Reject invalid execution before runtime."
export type ExecutionValidationResult = {
  readonly valid: boolean
  readonly issues: readonly ExecutionValidationIssue[]
}
