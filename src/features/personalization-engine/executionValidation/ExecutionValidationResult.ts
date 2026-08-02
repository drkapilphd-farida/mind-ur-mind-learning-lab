import type { ExecutionValidationIssue } from './ExecutionValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "execution plan integrity" as a whole.
export type ExecutionValidationResult = {
  readonly valid: boolean
  readonly issues: readonly ExecutionValidationIssue[]
}
