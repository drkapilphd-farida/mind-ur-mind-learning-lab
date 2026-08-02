import type { Memory } from '../domain'
import type { MemoryIndex } from '../indexDomain'
import { BUILTIN_INDEX_KEY_EXTRACTORS } from '../builtinIndexes'
import { removeMemoryFromIndex } from './removeMemoryFromIndex'

// Pure — "Update index": reflects one memory's *current* state in an
// existing index. First removes every prior association for this
// memory's id (so a changed field — e.g. a re-tagged memory — doesn't
// leave a stale entry behind), then re-adds it under whatever keys the
// memory currently produces. This correctly handles both "this memory
// was never indexed before" (the removal step is a no-op) and "this
// memory's indexed field changed" in a single pass.
export function updateMemoryIndex(index: MemoryIndex, memory: Memory, now: string): MemoryIndex {
  const withoutMemory = removeMemoryFromIndex(index, memory.id, now)
  const extractor = BUILTIN_INDEX_KEY_EXTRACTORS[index.metadata.indexType]
  const keys = extractor(memory)

  if (keys.length === 0) {
    return withoutMemory
  }

  const entriesByKey = new Map(withoutMemory.entries.map((entry) => [entry.key, entry]))

  for (const key of keys) {
    const existing = entriesByKey.get(key)
    entriesByKey.set(key, existing ? { key, memoryIds: [...existing.memoryIds, memory.id] } : { key, memoryIds: [memory.id] })
  }

  const entries = [...entriesByKey.values()].sort((a, b) => a.key.localeCompare(b.key))

  return { metadata: { ...withoutMemory.metadata, updatedAt: now }, entries }
}
