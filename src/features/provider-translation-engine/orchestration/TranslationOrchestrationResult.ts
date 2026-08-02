import type { ProviderRequest } from '../types'
import type { TranslationValidationResult } from '../validation'
import type { TranslationDiagnostics } from '../diagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the translated request, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this session.
export type TranslationOrchestrationResult = {
  readonly request: ProviderRequest
  readonly validationResult: TranslationValidationResult
  readonly diagnostics: TranslationDiagnostics
}
