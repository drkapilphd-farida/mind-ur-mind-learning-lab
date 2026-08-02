import type { TranslationValidationIssue } from './TranslationValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Provider translation integrity" as a whole.
export type TranslationValidationResult = {
  readonly valid: boolean
  readonly issues: readonly TranslationValidationIssue[]
}
