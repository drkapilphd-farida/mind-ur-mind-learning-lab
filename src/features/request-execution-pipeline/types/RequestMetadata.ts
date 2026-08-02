// Immutable — every field `readonly`. The "Metadata" selection
// dimension (§ brief) — same `learnerId`/`profileId`/`source`/
// `generatedAt` convention as every prior engine's metadata type this
// session (e.g. `provider-translation-engine`'s `ProviderRequestMetadata`).
export type RequestMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
