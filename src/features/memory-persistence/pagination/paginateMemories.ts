import type { Memory } from '../domain'

// "Provider-independent pagination... limit, offset. No cursor-based
// implementation yet." A pure function — `limit: null` means
// unbounded (return everything from `offset` onward).
export function paginateMemories(memories: readonly Memory[], limit: number | null, offset: number): readonly Memory[] {
  const sliced = memories.slice(offset)
  return limit === null ? sliced : sliced.slice(0, limit)
}
