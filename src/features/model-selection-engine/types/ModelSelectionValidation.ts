import type { ModelSelectionValidationIssue } from './ModelSelectionValidationIssue'

// Immutable — every field `readonly`. The shared result wrapper every
// validator in `../validation/` returns.
export type ModelSelectionValidation = {
  readonly valid: boolean
  readonly issues: readonly ModelSelectionValidationIssue[]
}
