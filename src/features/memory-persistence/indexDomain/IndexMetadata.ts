import type { IndexType } from './IndexType'

// Bookkeeping carried alongside an index's own entries — distinct from
// `IndexStatistics` (a computed, on-demand diagnostic snapshot; see
// `indexStatistics/`). Immutable — every field `readonly`.
export type IndexMetadata = {
  readonly indexType: IndexType
  readonly createdAt: string
  readonly updatedAt: string
}
