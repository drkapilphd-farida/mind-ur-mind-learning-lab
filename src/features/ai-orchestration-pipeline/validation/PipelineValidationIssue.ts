import type { PipelineStage } from '../types'

// "Missing pipeline stages, Invalid transitions, Duplicate execution,
// Configuration compliance, Pipeline integrity" — the Sprint 34
// brief's own Section 4 list, verbatim.
export type PipelineValidationIssueType = 'missing-stage' | 'invalid-transition' | 'duplicate-execution' | 'configuration-violation' | 'pipeline-integrity'

// Immutable — every field `readonly`.
export type PipelineValidationIssue = {
  readonly type: PipelineValidationIssueType
  readonly stage: PipelineStage | null
  readonly detail: string
}
