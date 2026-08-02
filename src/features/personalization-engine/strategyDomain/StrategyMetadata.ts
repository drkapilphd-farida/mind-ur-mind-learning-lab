// Immutable — every field `readonly`, `tags` a `readonly` array. Same
// `source`/`tags` convention already established across this feature.
export type StrategyMetadata = {
  readonly source: string
  readonly tags: readonly string[]
}
