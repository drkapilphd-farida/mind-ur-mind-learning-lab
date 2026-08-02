import type { IndexValidationIssue } from './IndexValidationIssue'

// Immutable — every field `readonly`. "Consistency verification" is
// this result as a whole: `valid` is true iff `issues` is empty.
export type IndexValidationResult = {
  readonly valid: boolean
  readonly issues: readonly IndexValidationIssue[]
}
