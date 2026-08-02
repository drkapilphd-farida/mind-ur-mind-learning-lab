// Immutable — every field `readonly`, `tags` a `readonly` array.
export type MemoryMetadata = {
  readonly learnerId: string
  readonly source: string
  readonly tags: readonly string[]
}
