// "Missing payload sections, Invalid mappings, Duplicate mappings,
// Version compatibility, Configuration compliance" — the Sprint 31
// brief's own Section 4 list, verbatim.
export type TranslationValidationIssueType = 'missing-section' | 'invalid-mapping' | 'duplicate-mapping' | 'version-incompatible' | 'configuration-violation'

// Immutable — every field `readonly`.
export type TranslationValidationIssue = {
  readonly type: TranslationValidationIssueType
  readonly referenceId: string | null
  readonly detail: string
}
