// Immutable — every field `readonly`. Same `learnerId`/`profileId`/
// `source`/`generatedAt` convention as every prior engine's metadata
// type this session.
export type ProviderResponseMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
