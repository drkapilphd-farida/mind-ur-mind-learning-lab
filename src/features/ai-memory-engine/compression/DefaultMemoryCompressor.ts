import type { MemoryPriority, MemoryRecord } from '../types'
import type { MemoryCompressor } from '../contracts'

const PRIORITY_ORDER: readonly MemoryPriority[] = ['critical', 'high', 'medium', 'low', 'temporary']

function priorityRank(priority: MemoryPriority): number {
  return PRIORITY_ORDER.indexOf(priority)
}

// Implements MemoryCompressor. Sorts highest-priority-first, most-
// recent-first within a priority, then takes the top `maxRecords` —
// never a random or arbitrary subset.
export class DefaultMemoryCompressor implements MemoryCompressor {
  compress(records: readonly MemoryRecord[], maxRecords: number): readonly MemoryRecord[] {
    if (maxRecords <= 0) return []

    return [...records].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.createdAt.localeCompare(a.createdAt)).slice(0, maxRecords)
  }
}

export function createMemoryCompressor(): MemoryCompressor {
  return new DefaultMemoryCompressor()
}
