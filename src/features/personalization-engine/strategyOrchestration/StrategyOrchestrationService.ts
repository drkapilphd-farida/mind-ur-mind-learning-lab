import type { StrategyEvaluationInputs } from '../strategyEvaluation'
import type { StrategyOrchestrationResult } from './StrategyOrchestrationResult'

// "Load strategies, Evaluate, Select, Produce immutable strategy
// results. Repositories remain free of business logic." Synchronous —
// `StrategyRegistry` is a plain in-memory lookup (no real I/O), so
// wrapping this in a Promise would only be a cosmetic formality.
export interface StrategyOrchestrationService {
  execute(inputs: StrategyEvaluationInputs): StrategyOrchestrationResult
}
