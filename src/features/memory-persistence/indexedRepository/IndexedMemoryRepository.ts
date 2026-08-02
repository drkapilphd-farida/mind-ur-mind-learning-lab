import type { Memory } from '../domain'
import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexValidationResult } from '../indexValidation'
import type { IndexStatistics } from '../indexStatistics'
import type { QueryableMemoryRepository } from '../queryableRepository'

// "Extend repository implementations to utilize indexes internally
// where appropriate. Maintain full backward compatibility. No changes
// to public behavior." — every method inherited from
// QueryableMemoryRepository (and, transitively, MemoryRepository)
// keeps its exact existing contract and results; the methods added
// here are a diagnostics-only surface (mirroring `indexStatistics`'s
// own "for diagnostics only" framing), never consumed by any
// retrieval-path logic, so nothing that already depends on
// QueryableMemoryRepository or plain MemoryRepository observes any
// behavior change.
export interface IndexedMemoryRepository extends QueryableMemoryRepository {
  getIndex(indexType: IndexType): MemoryIndex | null
  listIndexes(): readonly MemoryIndex[]
  rebuildAllIndexes(memories: readonly Memory[]): void
  validateAllIndexes(memories: readonly Memory[]): ReadonlyMap<IndexType, IndexValidationResult>
  getStatistics(indexType: IndexType, memories: readonly Memory[]): IndexStatistics | null
}
