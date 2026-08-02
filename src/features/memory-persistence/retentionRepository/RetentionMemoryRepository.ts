import type { MemoryId } from '../domain'
import type { RetentionMetadata } from '../retentionDomain'
import type { TransactionalMemoryRepository } from '../transactionalRepository'

// "Extend repository contracts to support retention operations without
// breaking existing interfaces. Maintain additive-only changes." Every
// method inherited from TransactionalMemoryRepository (and,
// transitively, every earlier sprint's repository layer) keeps its
// exact existing contract and results unchanged; `getRetentionMetadata`/
// `setRetentionMetadata` are genuinely new capabilities — persisted,
// explicit overrides ("Retention extension", "Cleanup exclusion") that
// have no equivalent on any prior layer.
export interface RetentionMemoryRepository extends TransactionalMemoryRepository {
  getRetentionMetadata(memoryId: MemoryId): Promise<RetentionMetadata | null>
  setRetentionMetadata(metadata: RetentionMetadata): Promise<void>
}
