import type { ExecutionResult, ExecutionRuntimeDiagnostics, ExecutionSession } from '../types'
import type { ExecutionValidationResult } from '../validation'

// Immutable — every field `readonly`. The service's own return
// wrapper — mirrors every prior sprint's own `<X>OrchestrationResult`
// wrapper, holding the session's final state, its terminal result, its
// validation outcome, and its diagnostics, always returned together.
export type ExecutionEngineResult = {
  readonly session: ExecutionSession
  readonly result: ExecutionResult
  readonly validationResult: ExecutionValidationResult
  readonly diagnostics: ExecutionRuntimeDiagnostics
}
