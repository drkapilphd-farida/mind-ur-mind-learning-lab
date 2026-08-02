import type { MemoryQuery } from './MemoryQuery'
import { InvalidMemoryQueryError } from './InvalidMemoryQueryError'

// Pure — throws on the first structural problem found, never silently
// coerces (e.g. clamping a negative limit to 0).
export function validateMemoryQuery(query: MemoryQuery): void {
  if (query.userId.trim().length === 0) throw new InvalidMemoryQueryError('userId must not be empty')
  if (query.limit !== null && query.limit < 0) throw new InvalidMemoryQueryError('limit must not be negative')
  if (query.offset < 0) throw new InvalidMemoryQueryError('offset must not be negative')

  if (query.dateRange && query.dateRange.from !== null && query.dateRange.to !== null && query.dateRange.from > query.dateRange.to) {
    throw new InvalidMemoryQueryError('dateRange.from must not be after dateRange.to')
  }
}
