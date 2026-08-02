import type { IndexType, MemoryIndex } from '../indexDomain'

// "Registering and managing available indexes... Register index,
// Remove index, Retrieve index, List registered indexes." One
// registered index per `IndexType` — registering again with the same
// type replaces the previous registration.
export interface IndexRegistry {
  registerIndex(index: MemoryIndex): void
  removeIndex(indexType: IndexType): void
  retrieveIndex(indexType: IndexType): MemoryIndex | null
  listRegisteredIndexes(): readonly MemoryIndex[]
}
