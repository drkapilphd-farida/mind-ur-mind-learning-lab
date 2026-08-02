import type { TransactionValidationIssue } from './TransactionValidationIssue'

// Immutable — every field `readonly`. "Transaction integrity" is this
// result as a whole: `valid` is true iff `issues` is empty.
export type TransactionValidationResult = {
  readonly valid: boolean
  readonly issues: readonly TransactionValidationIssue[]
}
