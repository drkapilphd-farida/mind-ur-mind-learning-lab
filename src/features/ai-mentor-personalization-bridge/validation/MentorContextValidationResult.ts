import type { MentorContextValidationIssue } from './MentorContextValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Mentor context integrity" as a whole.
export type MentorContextValidationResult = {
  readonly valid: boolean
  readonly issues: readonly MentorContextValidationIssue[]
}
