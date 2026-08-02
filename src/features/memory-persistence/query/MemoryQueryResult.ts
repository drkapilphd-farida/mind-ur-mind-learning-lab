import type { Memory } from '../domain'
import type { MemoryQuery } from './MemoryQuery'
import type { MemorySortField } from './MemorySortField'
import type { SortDirection } from './SortDirection'

export type MemorySortMetadata = {
  readonly field: MemorySortField
  readonly direction: SortDirection
}

// Immutable — every field `readonly`. `totalCount` is the number of
// matches *before* pagination; `returnedCount` is `items.length` after
// it — both real, computed numbers, never estimated.
export type MemoryQueryResult = {
  readonly items: readonly Memory[]
  readonly totalCount: number
  readonly returnedCount: number
  readonly appliedFilters: MemoryQuery
  readonly sortMetadata: MemorySortMetadata
}
