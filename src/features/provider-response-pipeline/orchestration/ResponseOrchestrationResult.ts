import type { ProviderExecutionResponse, ProviderResponseDiagnostics } from '../types'
import type { ResponseValidationResult } from '../validation'

// Immutable — every field `readonly`. What one orchestration run
// produces: the normalized response, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this session.
export type ResponseOrchestrationResult = {
  readonly response: ProviderExecutionResponse
  readonly validationResult: ResponseValidationResult
  readonly diagnostics: ProviderResponseDiagnostics
}
