// Immutable — every field `readonly`. Same `learnerId`/`profileId`/
// `source`/`generatedAt` convention as `ExecutionMetadata`/
// `RecommendationMetadata`.
export type AdaptationMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
