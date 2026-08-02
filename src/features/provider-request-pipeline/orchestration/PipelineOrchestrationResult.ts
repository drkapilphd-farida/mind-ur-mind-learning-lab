import type { ProviderExecutionDiagnostics, ProviderExecutionRequest } from '../types'
import type { PipelineValidationResult } from '../validation'

// Immutable — every field `readonly`. What one orchestration run
// produces: the built request, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this session.
export type PipelineOrchestrationResult = {
  readonly request: ProviderExecutionRequest
  readonly validationResult: PipelineValidationResult
  readonly diagnostics: ProviderExecutionDiagnostics
}
