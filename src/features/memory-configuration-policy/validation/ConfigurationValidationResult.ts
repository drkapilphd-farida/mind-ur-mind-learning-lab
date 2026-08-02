import type { ConfigurationValidationIssue } from './ConfigurationValidationIssue'

// Immutable — every field `readonly`. "Configuration consistency" is
// this result as a whole: `valid` is true iff `issues` is empty.
export type ConfigurationValidationResult = {
  readonly valid: boolean
  readonly issues: readonly ConfigurationValidationIssue[]
}
