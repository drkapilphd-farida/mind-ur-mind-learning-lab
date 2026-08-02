import type { Memory, MemoryId } from '../domain'
import type { IndexEntry, IndexType, MemoryIndex } from '../indexDomain'
import { BUILTIN_INDEX_KEY_EXTRACTORS } from '../builtinIndexes'

// Pure — "Build index": builds a brand-new index from scratch given
// the authoritative set of memories. Entries are sorted by `key`
// (locale-compare) so the result is deterministic regardless of the
// given memories' order.
export function buildMemoryIndex(indexType: IndexType, memories: readonly Memory[], now: string): MemoryIndex {
  const extractor = BUILTIN_INDEX_KEY_EXTRACTORS[indexType]
  const memoryIdsByKey = new Map<string, MemoryId[]>()

  for (const memory of memories) {
    for (const key of extractor(memory)) {
      const existing = memoryIdsByKey.get(key)
      if (existing) {
        existing.push(memory.id)
      } else {
        memoryIdsByKey.set(key, [memory.id])
      }
    }
  }

  const entries: IndexEntry[] = [...memoryIdsByKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, memoryIds]) => ({ key, memoryIds }))

  return {
    metadata: { indexType, createdAt: now, updatedAt: now },
    entries,
  }
}
