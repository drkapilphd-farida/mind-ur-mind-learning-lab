import type { ExecutionPolicyValidationIssue } from './ExecutionPolicyValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper every
// validator in `../validation/` returns.
export type ExecutionPolicyValidation = {
  readonly valid: boolean
  readonly issues: readonly ExecutionPolicyValidationIssue[]
}
