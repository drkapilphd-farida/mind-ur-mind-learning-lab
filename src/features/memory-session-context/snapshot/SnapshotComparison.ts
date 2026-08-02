import type { ContextEntry } from '../domain'

// Immutable diff result — every field `readonly`. Entries are compared
// by `id`.
export type SnapshotComparison = {
  readonly added: readonly ContextEntry[]
  readonly removed: readonly ContextEntry[]
  readonly unchanged: readonly ContextEntry[]
}
