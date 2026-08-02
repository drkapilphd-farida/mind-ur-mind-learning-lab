import type { Memory } from '../domain'
import type { MemoryDateRange } from '../query'
import type { MemorySpecification } from './MemorySpecification'

// Filters on `Memory.createdAt`. Either bound may be `null` (open on
// that side).
export function createDateRangeSpecification(range: MemoryDateRange): MemorySpecification {
  return {
    isSatisfiedBy: (memory: Memory) => {
      if (range.from !== null && memory.createdAt < range.from) return false
      if (range.to !== null && memory.createdAt > range.to) return false
      return true
    },
  }
}
