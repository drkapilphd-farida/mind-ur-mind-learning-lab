import type { AdaptiveLearningPlan } from '@/features/adaptive-learning-planner'
import type { ContextPackage } from '@/features/memory-context-assembly'
import type { MemoryConfiguration } from '@/features/memory-configuration-policy'
import type { PersonalizationDecision } from '../domain'
import type { StrategyResult } from '../strategyDomain'
import type { ExecutionPlannerInputs } from '../executionPlanning'
import { buildAdaptivePlanFacts } from './buildAdaptivePlanFacts'
import { buildMemoryContextFacts } from './buildMemoryContextFacts'
import { buildConfigurationFacts } from './buildConfigurationFacts'

// The raw inputs a caller supplies for one execution-planning run —
// "Personalization Decisions, Selected Strategies, Adaptive Learning
// Planner inputs, Memory Context, Configuration" (Sprint 25 Section 2),
// using each one's real "approved infrastructure" type.
export type ExecutionPlanningInputs = {
  readonly profileId: string
  readonly learnerId: string
  readonly decisions: readonly PersonalizationDecision[]
  readonly strategyResults: readonly StrategyResult[]
  readonly adaptivePlan: AdaptiveLearningPlan | null
  readonly memoryContext: ContextPackage | null
  readonly configuration: MemoryConfiguration | null
}

// Pure — the one function that turns real "approved infrastructure"
// values into the fully self-contained `ExecutionPlannerInputs` the
// Execution Planner™ consumes. Same "single seam" role as
// `buildPersonalizationContext.ts` (Sprint 23) — reuses the *existing*
// AI Memory Engine™ / Configuration reducers rather than duplicating
// them, and adds only the one new Adaptive Learning Planner™ reducer.
export function buildExecutionPlannerInputs(inputs: ExecutionPlanningInputs): ExecutionPlannerInputs {
  return {
    profileId: inputs.profileId,
    learnerId: inputs.learnerId,
    decisions: inputs.decisions,
    strategyResults: inputs.strategyResults,
    adaptivePlanFacts: buildAdaptivePlanFacts(inputs.adaptivePlan),
    memoryFacts: buildMemoryContextFacts(inputs.memoryContext),
    configurationFacts: buildConfigurationFacts(inputs.configuration),
  }
}
