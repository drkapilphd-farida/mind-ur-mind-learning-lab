export { buildMemoryContextFacts } from './buildMemoryContextFacts'
export { buildSessionContextFacts } from './buildSessionContextFacts'
export { buildConfigurationFacts } from './buildConfigurationFacts'
export type { EvaluationInputs } from './EvaluationInputs'
export { buildPersonalizationContext } from './buildPersonalizationContext'

// Sprint 25 — Execution Engine™. Additive only, nothing above this line
// changed.
export { buildAdaptivePlanFacts } from './buildAdaptivePlanFacts'
export { buildExecutionPlannerInputs, type ExecutionPlanningInputs } from './buildExecutionPlannerInputs'

// Sprint 26 — Recommendation Engine™. Additive only, nothing above this
// line changed.
export { buildRecommendationBuilderInputs, type RecommendationBuildingInputs } from './buildRecommendationBuilderInputs'

// Sprint 27 — Adaptation Engine™. Additive only, nothing above this
// line changed.
export { buildAdaptationEvaluatorInputs, type AdaptationEvaluatingInputs } from './buildAdaptationEvaluatorInputs'
