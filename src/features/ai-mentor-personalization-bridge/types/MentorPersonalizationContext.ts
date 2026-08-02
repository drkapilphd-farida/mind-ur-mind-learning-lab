import type { MentorLearningState } from './MentorLearningState'
import type { MentorMemoryReference } from './MentorMemoryReference'
import type { MentorRecommendationSet } from './MentorRecommendationSet'

// Immutable — every field `readonly`. Named `MentorPersonalizationContext`,
// not the Sprint 28 brief's own literal "MentorContext," to avoid
// colliding with the *existing*, unrelated `MentorContext` at
// `@/features/ai-mentor/types/context.ts` (the conversation/insight/
// recommendation bundle for one reply-generation turn — a different
// concept). Same fix the codebase already applied to `AdaptiveLearningPlan`
// (renamed to avoid ambiguity with an unrelated, existing `LearningPlan`)
// and `PersonalizationRecommendationSet` (Sprint 26).
//
// "Current Journey, Active Recommendations, Learning Progress, Memory
// Summary References, Personalization State" (§4) — all 5 sub-items,
// one field each (`learningState` covers the last two).
export type MentorPersonalizationContext = {
  readonly currentJourney: string | null
  readonly recommendations: MentorRecommendationSet
  readonly learningState: MentorLearningState
  readonly memoryReferences: readonly MentorMemoryReference[]
}
