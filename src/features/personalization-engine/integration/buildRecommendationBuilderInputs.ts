import type { ContextPackage } from '@/features/memory-context-assembly'
import type { MemoryConfiguration } from '@/features/memory-configuration-policy'
import type { PersonalizationDecision } from '../domain'
import type { StrategyResult } from '../strategyDomain'
import type { PersonalizationExecutionPlan } from '../executionDomain'
import type { RecommendationBuilderInputs } from '../recommendationBuilder'
import { buildMemoryContextFacts } from './buildMemoryContextFacts'
import { buildConfigurationFacts } from './buildConfigurationFacts'

// The raw inputs a caller supplies for one recommendation-building run.
// No new "approved infrastructure" type is needed this sprint: the
// Adaptive Learning Planner™ contribution is already carried inside
// `executionPlan` (Sprint 25 already reduced it there), so this
// composer only reuses the *existing* AI Memory Engine™/Configuration
// reducers — same "single seam" role as
// `buildExecutionPlannerInputs.ts` (Sprint 25).
export type RecommendationBuildingInputs = {
  readonly profileId: string
  readonly learnerId: string
  readonly executionPlan: PersonalizationExecutionPlan
  readonly decisions: readonly PersonalizationDecision[]
  readonly strategyResults: readonly StrategyResult[]
  readonly memoryContext: ContextPackage | null
  readonly configuration: MemoryConfiguration | null
}

// Pure — the one function that turns real "approved infrastructure"
// values into the fully self-contained `RecommendationBuilderInputs`
// the Recommendation Builder™ consumes.
export function buildRecommendationBuilderInputs(inputs: RecommendationBuildingInputs): RecommendationBuilderInputs {
  return {
    profileId: inputs.profileId,
    learnerId: inputs.learnerId,
    executionPlan: inputs.executionPlan,
    decisions: inputs.decisions,
    strategyResults: inputs.strategyResults,
    memoryFacts: buildMemoryContextFacts(inputs.memoryContext),
    configurationFacts: buildConfigurationFacts(inputs.configuration),
  }
}
