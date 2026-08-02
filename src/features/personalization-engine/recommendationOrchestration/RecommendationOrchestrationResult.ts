import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { RecommendationValidationResult } from '../recommendationValidation'
import type { RecommendationDiagnostics } from '../recommendationDiagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the generated, ordered recommendation set, its validation
// outcome, and its diagnostics, always returned together — same
// "diagnostics alongside output" convention as
// `ExecutionOrchestrationResult`/`StrategyOrchestrationResult`.
export type RecommendationOrchestrationResult = {
  readonly recommendationSet: PersonalizationRecommendationSet
  readonly validationResult: RecommendationValidationResult
  readonly diagnostics: RecommendationDiagnostics
}
