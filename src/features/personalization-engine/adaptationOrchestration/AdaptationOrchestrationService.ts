import type { AdaptationEvaluatorInputs } from '../adaptationEvaluation'
import type { AdaptationOrchestrationResult } from './AdaptationOrchestrationResult'

// "Evaluate adaptations, Validate results, Produce immutable output,
// Generate diagnostics. Repositories remain business-logic free."
// Synchronous — every step of this pipeline is a pure, deterministic
// transform with no I/O, same as every prior orchestrator in this
// feature.
export interface AdaptationOrchestrationService {
  generate(inputs: AdaptationEvaluatorInputs): AdaptationOrchestrationResult
}
