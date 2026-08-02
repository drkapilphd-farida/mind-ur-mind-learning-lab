import type { ContextPackage } from '@/features/memory-context-assembly'
import type { MemoryConfiguration } from '@/features/memory-configuration-policy'
import type { PersonalizationFacts, PersonalizationProfile } from '../domain'
import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { AdaptationEvaluatorInputs } from '../adaptationEvaluation'
import { buildMemoryContextFacts } from './buildMemoryContextFacts'
import { buildConfigurationFacts } from './buildConfigurationFacts'

// The raw inputs a caller supplies for one adaptation-evaluation run —
// "Personalization Profile, Recommendation Results, Learning Progress,
// Assessment Results, Memory Context, Configuration Policies" (Sprint
// 27 §2). `assessmentResults`/`learningProgress` have no corresponding
// "approved infrastructure" type — same as Sprint 23's own
// `EvaluationInputs` — so they're supplied pre-reduced by the caller.
export type AdaptationEvaluatingInputs = {
  readonly learnerId: string
  readonly profile: PersonalizationProfile
  readonly recommendationSet: PersonalizationRecommendationSet
  readonly assessmentResults: PersonalizationFacts
  readonly learningProgress: PersonalizationFacts
  readonly memoryContext: ContextPackage | null
  readonly configuration: MemoryConfiguration | null
}

// Pure — the one function that turns real "approved infrastructure"
// values into the fully self-contained `AdaptationEvaluatorInputs` the
// Adaptation Evaluator™ consumes. Reuses the *existing* AI Memory
// Engine™/Configuration reducers — no new cross-feature import types
// needed this sprint (the Adaptive Learning Planner™ contribution is
// already carried inside `recommendationSet`, same reasoning as Sprint
// 26's own `buildRecommendationBuilderInputs.ts`).
export function buildAdaptationEvaluatorInputs(inputs: AdaptationEvaluatingInputs): AdaptationEvaluatorInputs {
  return {
    learnerId: inputs.learnerId,
    profile: inputs.profile,
    recommendationSet: inputs.recommendationSet,
    assessmentResults: inputs.assessmentResults,
    learningProgress: inputs.learningProgress,
    memoryFacts: buildMemoryContextFacts(inputs.memoryContext),
    configurationFacts: buildConfigurationFacts(inputs.configuration),
  }
}
