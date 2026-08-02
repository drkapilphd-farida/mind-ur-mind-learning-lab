import type { Memory, MemoryImportance } from '../domain'
import type { MemorySortField, SortDirection } from '../query'
import type { MemorySorter } from './MemorySorter'

// Higher number = more important; 'descending' therefore means
// most-important-first (critical -> temporary), matching how every
// other importance/priority sort in this codebase already orders
// (critical first).
const IMPORTANCE_SCORE: Record<MemoryImportance, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  temporary: 0,
}

function sortValue(memory: Memory, field: MemorySortField): string | number {
  switch (field) {
    case 'createdAt':
      return memory.createdAt
    case 'updatedAt':
      return memory.updatedAt
    case 'importance':
      return IMPORTANCE_SCORE[memory.importance]
    case 'lastAccessedAt':
      // No dedicated access-tracking field exists on Sprint 13's
      // `Memory` model yet — `updatedAt` is the best available proxy,
      // documented here rather than silently wrong.
      return memory.updatedAt
  }
}

// Implements MemorySorter. Deterministic: ties are broken by `id`
// (stable, always-present, always-unique) so repeated calls on
// identical input always produce the identical output order.
export class DefaultMemorySorter implements MemorySorter {
  sort(memories: readonly Memory[], field: MemorySortField, direction: SortDirection): readonly Memory[] {
    const multiplier = direction === 'ascending' ? 1 : -1

    return [...memories].sort((a, b) => {
      const valueA = sortValue(a, field)
      const valueB = sortValue(b, field)
      if (valueA < valueB) return -1 * multiplier
      if (valueA > valueB) return 1 * multiplier
      return a.id.localeCompare(b.id)
    })
  }
}

export function createMemorySorter(): MemorySorter {
  return new DefaultMemorySorter()
}
