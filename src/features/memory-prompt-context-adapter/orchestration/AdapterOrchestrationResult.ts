import type { ContextPayload } from '../domain'
import type { AdapterDiagnostics } from '../diagnostics'
import type { PayloadValidationResult } from '../validation'

// Immutable — every field `readonly`. What one orchestration run
// produces: the payload itself, its validation outcome, and its
// diagnostics — all three always returned together.
export type AdapterOrchestrationResult = {
  readonly payload: ContextPayload
  readonly validationResult: PayloadValidationResult
  readonly diagnostics: AdapterDiagnostics
}
