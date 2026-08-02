import type { PersonalizationDecision, PersonalizationFacts } from '../domain'
import type { StrategyResult } from '../strategyDomain'
import type { AdaptivePlanExecutionFacts } from '../executionDomain'

// "Personalization Decisions, Selected Strategies, Adaptive Learning
// Planner inputs, Memory Context, Configuration" — the Sprint 25
// brief's own Section 2 input list. Every field is either a
// same-feature domain type (`decisions`, `strategyResults`) or an
// already-reduced flat facts shape (`adaptivePlanFacts`, `memoryFacts`,
// `configurationFacts`) — the real reduction from external "approved
// infrastructure" types happens in
// `../integration/buildExecutionPlannerInputs.ts`, never here.
export type ExecutionPlannerInputs = {
  readonly profileId: string
  readonly learnerId: string
  readonly decisions: readonly PersonalizationDecision[]
  readonly strategyResults: readonly StrategyResult[]
  readonly adaptivePlanFacts: AdaptivePlanExecutionFacts
  readonly memoryFacts: PersonalizationFacts
  readonly configurationFacts: PersonalizationFacts
}
