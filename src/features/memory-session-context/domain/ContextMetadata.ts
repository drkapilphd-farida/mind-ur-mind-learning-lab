// Immutable — every field `readonly`, `tags` a `readonly` array.
export type ContextMetadata = {
  readonly ownerId: string
  readonly source: string
  readonly tags: readonly string[]
}
