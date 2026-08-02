import type { RecommendationBuilderInputs } from '../recommendationBuilder'
import type { RecommendationOrchestrationResult } from './RecommendationOrchestrationResult'

// "Generate recommendation set, Validate recommendations, Produce
// immutable output, Generate diagnostics. Repositories remain
// business-logic free." Synchronous — every step of this pipeline is a
// pure, deterministic transform with no I/O, same as
// `ExecutionOrchestrationService`/`StrategyOrchestrationService`.
export interface RecommendationOrchestrationService {
  generate(inputs: RecommendationBuilderInputs): RecommendationOrchestrationResult
}
