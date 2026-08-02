// "Missing request fields, Invalid provider profile, Unsupported
// versions, Duplicate metadata, Configuration compliance" — the
// Sprint 32 brief's own Section 4 list, verbatim.
export type PipelineValidationIssueType = 'missing-field' | 'invalid-provider-profile' | 'unsupported-version' | 'duplicate-metadata' | 'configuration-violation'

// Immutable — every field `readonly`.
export type PipelineValidationIssue = {
  readonly type: PipelineValidationIssueType
  readonly referenceId: string | null
  readonly detail: string
}
