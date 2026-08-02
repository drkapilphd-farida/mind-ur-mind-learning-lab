import type { Memory, MemoryId } from '../domain'
import type { MemoryCache } from '../contracts'

// Implements MemoryCache — "Provide in-memory implementation only."
// A private Map, synchronous throughout (a cache should never be
// slower than the thing it's caching).
export class InMemoryMemoryCache implements MemoryCache {
  private readonly entries = new Map<MemoryId, Memory>()

  get(id: MemoryId): Memory | null {
    return this.entries.get(id) ?? null
  }

  set(memory: Memory): void {
    this.entries.set(memory.id, memory)
  }

  remove(id: MemoryId): void {
    this.entries.delete(id)
  }

  clear(): void {
    this.entries.clear()
  }
}

export function createMemoryCache(): MemoryCache {
  return new InMemoryMemoryCache()
}
