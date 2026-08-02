import type { Memory } from '../domain'
import type { MemorySortField, SortDirection } from '../query'

// Pure — never mutates the given array, always returns a new one.
export interface MemorySorter {
  sort(memories: readonly Memory[], field: MemorySortField, direction: SortDirection): readonly Memory[]
}
