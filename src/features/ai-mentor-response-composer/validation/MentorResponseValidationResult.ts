import type { MentorResponseValidationIssue } from './MentorResponseValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Mentor response structure" integrity as a whole.
export type MentorResponseValidationResult = {
  readonly valid: boolean
  readonly issues: readonly MentorResponseValidationIssue[]
}
