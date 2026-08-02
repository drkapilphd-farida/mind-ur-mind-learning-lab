import type { PersonalizationStrategy, StrategyId } from '../strategyDomain'
import type { StrategyValidationResult } from '../strategyValidation'

// "Register strategy, Remove strategy, Resolve strategy, List
// strategies, Validate strategy definitions." The same registry shape
// convention as `policyRegistry/PolicyRegistry.ts` (Sprint 20's
// Configuration & Policy Engine™, an approved dependency — mirrored
// here, not imported, since strategies and configuration profiles are
// unrelated entities).
export interface StrategyRegistry {
  registerStrategy(strategy: PersonalizationStrategy): void
  removeStrategy(id: StrategyId): void
  resolveStrategy(id: StrategyId): PersonalizationStrategy | null
  listStrategies(): readonly PersonalizationStrategy[]
  validateStrategyDefinition(strategy: PersonalizationStrategy): StrategyValidationResult
}
