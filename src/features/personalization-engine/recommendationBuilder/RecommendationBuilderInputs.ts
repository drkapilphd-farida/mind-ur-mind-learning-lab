import type { PersonalizationDecision, PersonalizationFacts } from '../domain'
import type { StrategyResult } from '../strategyDomain'
import type { PersonalizationExecutionPlan } from '../executionDomain'

// "PersonalizationExecutionPlan, PersonalizationDecision, Strategy
// Results, Memory Context, Configuration Policies" — the Sprint 26
// brief's own Section 2 input list, verbatim. Every field is a
// same-feature type reused directly (`executionPlan` from Sprint 25,
// `decisions` from Sprint 23, `strategyResults` from Sprint 24) or an
// already-reduced flat facts shape (`memoryFacts`, `configurationFacts`)
// — real reduction from "approved infrastructure" happens in
// `../integration/buildRecommendationBuilderInputs.ts`.
export type RecommendationBuilderInputs = {
  readonly profileId: string
  readonly learnerId: string
  readonly executionPlan: PersonalizationExecutionPlan
  readonly decisions: readonly PersonalizationDecision[]
  readonly strategyResults: readonly StrategyResult[]
  readonly memoryFacts: PersonalizationFacts
  readonly configurationFacts: PersonalizationFacts
}
