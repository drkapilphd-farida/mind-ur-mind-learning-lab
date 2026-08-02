import type { PipelineValidationIssue } from './PipelineValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "Provider request integrity" as a whole.
export type PipelineValidationResult = {
  readonly valid: boolean
  readonly issues: readonly PipelineValidationIssue[]
}
