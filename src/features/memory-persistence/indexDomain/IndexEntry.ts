import type { MemoryId } from '../domain'
import type { IndexKey } from './IndexKey'

// One row within an index: a single key value mapped to every memory
// id currently associated with it (e.g. the `importance` index's
// `"high"` entry lists every high-importance memory's id). Immutable —
// every field `readonly`; `memoryIds` a `readonly` array.
export type IndexEntry = {
  readonly key: IndexKey
  readonly memoryIds: readonly MemoryId[]
}
