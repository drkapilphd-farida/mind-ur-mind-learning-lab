import type { MentorPromptValidationIssue } from './MentorPromptValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Prompt payload integrity" as a whole.
export type MentorPromptValidationResult = {
  readonly valid: boolean
  readonly issues: readonly MentorPromptValidationIssue[]
}
