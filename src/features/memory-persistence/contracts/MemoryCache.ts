import type { Memory, MemoryId } from '../domain'

// "Define provider-independent cache interface... Provide in-memory
// implementation only." — this sprint ships exactly one implementation
// (InMemoryMemoryCache); the interface itself is what stays
// provider-independent for a future swap (e.g. Redis).
export interface MemoryCache {
  get(id: MemoryId): Memory | null
  set(memory: Memory): void
  remove(id: MemoryId): void
  clear(): void
}
