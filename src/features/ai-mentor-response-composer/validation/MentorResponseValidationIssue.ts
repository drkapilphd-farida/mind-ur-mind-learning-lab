// "Empty response, Duplicate sections, Missing references, Invalid
// ordering, Configuration compliance" — the Sprint 29 brief's own
// Section 4 list, verbatim.
export type MentorResponseValidationIssueType = 'empty-response' | 'duplicate-section' | 'missing-reference' | 'invalid-ordering' | 'configuration-violation'

// Immutable — every field `readonly`.
export type MentorResponseValidationIssue = {
  readonly type: MentorResponseValidationIssueType
  readonly referenceId: string | null
  readonly detail: string
}
