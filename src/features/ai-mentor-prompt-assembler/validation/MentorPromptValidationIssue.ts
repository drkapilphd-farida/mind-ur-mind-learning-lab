// "Missing sections, Duplicate sections, Invalid ordering, Invalid
// references, Configuration compliance" — the Sprint 30 brief's own
// Section 4 list, verbatim.
export type MentorPromptValidationIssueType = 'missing-section' | 'duplicate-section' | 'invalid-ordering' | 'invalid-reference' | 'configuration-violation'

// Immutable — every field `readonly`.
export type MentorPromptValidationIssue = {
  readonly type: MentorPromptValidationIssueType
  readonly referenceId: string | null
  readonly detail: string
}
