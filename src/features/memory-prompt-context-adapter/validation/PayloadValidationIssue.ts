// "Empty payload, Duplicate references, Invalid mappings, Ordering
// consistency, Metadata completeness, Payload version compatibility" —
// the Sprint 22 brief's own six named validation checks.
export type PayloadValidationIssueType =
  | 'empty-payload'
  | 'duplicate-reference'
  | 'invalid-mapping'
  | 'ordering-violation'
  | 'incomplete-metadata'
  | 'version-incompatible'

// Immutable — every field `readonly`.
export type PayloadValidationIssue = {
  readonly type: PayloadValidationIssueType
  readonly detail: string
}
