import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexRegistry } from './IndexRegistry'

// Implements IndexRegistry — a private `Map<IndexType, MemoryIndex>`,
// the same in-memory storage convention as every other registry-shaped
// component in this codebase (e.g. `repository/InMemoryMemoryRepository.ts`).
export class DefaultIndexRegistry implements IndexRegistry {
  private readonly indexes = new Map<IndexType, MemoryIndex>()

  registerIndex(index: MemoryIndex): void {
    this.indexes.set(index.metadata.indexType, index)
  }

  removeIndex(indexType: IndexType): void {
    this.indexes.delete(indexType)
  }

  retrieveIndex(indexType: IndexType): MemoryIndex | null {
    return this.indexes.get(indexType) ?? null
  }

  listRegisteredIndexes(): readonly MemoryIndex[] {
    return [...this.indexes.values()]
  }
}

export function createIndexRegistry(): IndexRegistry {
  return new DefaultIndexRegistry()
}
