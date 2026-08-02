import type { StrategyResult } from '../strategyDomain'
import type { StrategyValidationResult } from '../strategyValidation'

// Immutable — every field `readonly`. What one orchestration run
// produces: the selected results and the registered strategy set's
// validation outcome, always returned together.
export type StrategyOrchestrationResult = {
  readonly results: readonly StrategyResult[]
  readonly validationResult: StrategyValidationResult
}
