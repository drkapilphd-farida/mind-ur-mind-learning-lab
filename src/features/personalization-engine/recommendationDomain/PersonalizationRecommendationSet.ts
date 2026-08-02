import type { RecommendationGroup } from './RecommendationGroup'
import type { RecommendationMetadata } from './RecommendationMetadata'

// Immutable — every field `readonly`. The Recommendation Engine's™
// whole output. Named `PersonalizationRecommendationSet`, not the Sprint
// 26 brief's own literal "PersonalizationRecommendation," to avoid
// colliding with the *existing*, unrelated `domain/PersonalizationRecommendation.ts`
// (Sprint 23 — one matched rule's contribution to a decision, a
// different concept). Same fix the codebase already applied to
// `AdaptiveLearningPlan` (renamed to avoid ambiguity with an unrelated,
// existing `LearningPlan`) — and the brief's own §6 language, "Generate
// recommendation **set**," already points at this name.
export type PersonalizationRecommendationSet = {
  readonly id: string
  readonly version: number
  readonly groups: readonly RecommendationGroup[]
  readonly metadata: RecommendationMetadata
}
