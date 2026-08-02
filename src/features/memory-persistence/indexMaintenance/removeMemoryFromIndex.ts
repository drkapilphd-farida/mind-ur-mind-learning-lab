import type { MemoryId } from '../domain'
import type { MemoryIndex } from '../indexDomain'

// Pure — "Remove index entries": removes every association for the
// given memory id across all entries; an entry whose `memoryIds`
// becomes empty as a result is dropped entirely (a well-formed index
// never carries orphaned empty entries as a normal outcome of
// removal — see `indexValidation/validateIndexConsistency.ts`'s
// "orphaned-entry" check for detecting entries that end up empty by
// other, abnormal means).
export function removeMemoryFromIndex(index: MemoryIndex, memoryId: MemoryId, now: string): MemoryIndex {
  const entries = index.entries
    .map((entry) => ({ key: entry.key, memoryIds: entry.memoryIds.filter((id) => id !== memoryId) }))
    .filter((entry) => entry.memoryIds.length > 0)

  return { metadata: { ...index.metadata, updatedAt: now }, entries }
}
