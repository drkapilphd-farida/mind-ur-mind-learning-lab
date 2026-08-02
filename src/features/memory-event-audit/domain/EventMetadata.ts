// Immutable — every field `readonly`, `tags` a `readonly` array.
// `subjectId` is an opaque reference to whatever this event is about
// (a memory id, transaction id, session id, ...) — this feature never
// dereferences it against any other feature's repository, only carries
// it for diagnostic/audit purposes.
export type EventMetadata = {
  readonly subjectId: string
  readonly userId: string
  readonly tags: readonly string[]
}
