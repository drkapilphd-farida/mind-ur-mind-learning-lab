// Immutable — every field `readonly`. Same `learnerId`/`profileId`/
// `source`/`generatedAt` convention as every prior engine's metadata
// type in this session (`ExecutionMetadata`, `RecommendationMetadata`,
// `AdaptationMetadata`).
export type MentorContextMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
