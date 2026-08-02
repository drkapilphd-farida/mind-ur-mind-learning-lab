// "Missing content, Invalid metadata, Unsupported provider version,
// Duplicate sections, Configuration compliance" — the Sprint 33
// brief's own Section 4 list, verbatim.
export type ResponseValidationIssueType = 'missing-content' | 'invalid-metadata' | 'unsupported-provider-version' | 'duplicate-sections' | 'configuration-violation'

// Immutable — every field `readonly`.
export type ResponseValidationIssue = {
  readonly type: ResponseValidationIssueType
  readonly referenceId: string | null
  readonly detail: string
}
