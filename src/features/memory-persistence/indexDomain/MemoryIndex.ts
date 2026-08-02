import type { IndexEntry } from './IndexEntry'
import type { IndexMetadata } from './IndexMetadata'

// The core immutable index model — every field `readonly`. Never
// mutated in place anywhere in this feature; every transformation
// (build, update, remove, rebuild — see `indexMaintenance/`) returns a
// *new* MemoryIndex value. Plain data (an array of entries, not a
// `Map`) so it stays framework-independent, serializable, and directly
// comparable in tests — the same "public models are arrays, not
// Maps" convention already used throughout this feature (e.g.
// `ContextSnapshot.entries`).
export type MemoryIndex = {
  readonly metadata: IndexMetadata
  readonly entries: readonly IndexEntry[]
}
