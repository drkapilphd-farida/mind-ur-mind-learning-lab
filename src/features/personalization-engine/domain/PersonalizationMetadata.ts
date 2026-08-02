// Immutable — every field `readonly`, `tags` a `readonly` array. Same
// `learnerId`/`source`/`tags` convention already established across
// this whole session's features.
export type PersonalizationMetadata = {
  readonly learnerId: string
  readonly source: string
  readonly tags: readonly string[]
}
