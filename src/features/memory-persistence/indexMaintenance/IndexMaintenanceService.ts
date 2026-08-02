import type { Memory, MemoryId } from '../domain'
import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexValidationResult } from '../indexValidation'

// "Build index, Update index, Remove index entries, Rebuild index,
// Validate index consistency. All operations must be deterministic."
export interface IndexMaintenanceService {
  buildIndex(indexType: IndexType, memories: readonly Memory[]): MemoryIndex
  updateIndex(index: MemoryIndex, memory: Memory): MemoryIndex
  removeIndexEntries(index: MemoryIndex, memoryId: MemoryId): MemoryIndex
  rebuildIndex(indexType: IndexType, memories: readonly Memory[]): MemoryIndex
  validateIndexConsistency(index: MemoryIndex, memories: readonly Memory[]): IndexValidationResult
}
