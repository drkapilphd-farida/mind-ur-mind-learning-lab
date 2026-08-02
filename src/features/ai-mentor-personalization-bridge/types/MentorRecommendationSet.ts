// Immutable — every field `readonly`. "Active Recommendations" (Sprint
// 28 §4), a flat, self-contained reduction of the Personalization
// Engine's™ `PersonalizationRecommendationSet` — real reduction happens
// in `../integration/buildMentorRecommendationSet.ts`.
//
// `MentorRecommendationReference` is not itself one of the brief's 5
// named domain models — it's this type's own structural component,
// same convention as `RecommendationItem` nested under
// `RecommendationGroup` (Sprint 26).
export type MentorRecommendationReference = {
  readonly category: string
  readonly referenceId: string
  readonly priority: string
}

export type MentorRecommendationSet = {
  readonly items: readonly MentorRecommendationReference[]
}
