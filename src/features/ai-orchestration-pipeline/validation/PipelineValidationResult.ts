import type { PipelineValidationIssue } from './PipelineValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "End-to-end orchestration" / "Pipeline state transitions"
// integrity as a whole.
export type PipelineValidationResult = {
  readonly valid: boolean
  readonly issues: readonly PipelineValidationIssue[]
}
