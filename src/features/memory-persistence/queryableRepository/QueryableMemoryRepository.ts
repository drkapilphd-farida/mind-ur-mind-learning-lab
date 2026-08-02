import type { Memory } from '../domain'
import type { MemoryRepository } from '../contracts'
import type { MemorySpecification } from '../specification'

// "Extend the repository contract to support deterministic querying
// without breaking existing interfaces. Maintain backward
// compatibility." — a true interface extension (`extends
// MemoryRepository`): anything typed as a plain `MemoryRepository`
// still works unchanged; `query()` is the one new capability. Takes a
// specification (not a raw MemoryQuery) — this contract stays ignorant
// of sorting/pagination/validation, which are MemoryQueryExecutionService's
// job ("No repository business logic leakage").
export interface QueryableMemoryRepository extends MemoryRepository {
  query(specification: MemorySpecification, userId: string): Promise<readonly Memory[]>
}
