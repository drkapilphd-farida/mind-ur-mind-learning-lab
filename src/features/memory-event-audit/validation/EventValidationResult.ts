import type { EventValidationIssue } from './EventValidationIssue'

// Immutable — every field `readonly`. "Audit integrity" is this result
// as a whole: `valid` is true iff `issues` is empty.
export type EventValidationResult = {
  readonly valid: boolean
  readonly issues: readonly EventValidationIssue[]
}
