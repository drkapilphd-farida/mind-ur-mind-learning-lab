// The 2 test-named failure concerns ("Invalid provider", "Duplicate
// provider") plus catalog-entry well-formedness.
export type ProviderSelectionValidationIssueType = 'invalid-provider' | 'duplicate-provider' | 'invalid-configuration'

// Immutable — every field `readonly`.
export type ProviderSelectionValidationIssue = {
  readonly type: ProviderSelectionValidationIssueType
  readonly detail: string
}
