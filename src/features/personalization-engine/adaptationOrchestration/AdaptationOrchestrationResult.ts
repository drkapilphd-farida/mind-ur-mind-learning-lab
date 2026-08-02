import type { PersonalizationAdaptation } from '../adaptationDomain'
import type { AdaptationValidationResult } from '../adaptationValidation'
import type { AdaptationDiagnostics } from '../adaptationDiagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the evaluated adaptation, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this feature.
export type AdaptationOrchestrationResult = {
  readonly adaptation: PersonalizationAdaptation
  readonly validationResult: AdaptationValidationResult
  readonly diagnostics: AdaptationDiagnostics
}
