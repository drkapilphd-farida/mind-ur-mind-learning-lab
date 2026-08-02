// Immutable — every field `readonly`. Same `learnerId`/`profileId`/
// `source`/`generatedAt` convention as `ExecutionMetadata` (Sprint 25).
export type RecommendationMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
