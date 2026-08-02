import type { PipelineStage } from './PipelineStage'

// "Pipeline stage, Completion status, Validation status, Execution
// timeline, Pipeline version" — the Sprint 34 brief's own Section 7
// list, verbatim. Placed here in `types/`, not `../diagnostics/`, per
// the brief's own explicit Section 1 listing of
// `AIOrchestrationDiagnostics` as one of the 5 domain models — same
// deliberate deviation Sprints 32-33 already applied. The *generator
// function* still lives in `../diagnostics/`. Immutable — every field
// `readonly`.
export type AIOrchestrationDiagnostics = {
  readonly pipelineStage: PipelineStage
  readonly completionStatus: 'completed' | 'failed'
  readonly validationStatus: 'valid' | 'invalid'
  readonly executionTimeline: readonly PipelineStage[]
  readonly pipelineVersion: number
}
