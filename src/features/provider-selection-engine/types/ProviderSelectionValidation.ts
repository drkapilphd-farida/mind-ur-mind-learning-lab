import type { ProviderSelectionValidationIssue } from './ProviderSelectionValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper every
// validator in `../validation/` returns.
export type ProviderSelectionValidation = {
  readonly valid: boolean
  readonly issues: readonly ProviderSelectionValidationIssue[]
}
