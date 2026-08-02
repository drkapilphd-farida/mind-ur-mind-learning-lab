import type { MemoryQuery, MemoryQueryResult } from '../query'
import { validateMemoryQuery } from '../query'
import type { QueryableMemoryRepository } from '../queryableRepository'
import type { MemorySorter } from '../sorting'
import { createMemorySorter } from '../sorting'
import { paginateMemories } from '../pagination'
import { buildSpecificationFromQuery } from '../specification'
import type { MemoryQueryExecutionService } from './MemoryQueryExecutionService'

export type MemoryQueryExecutionServiceDependencies = {
  repository: QueryableMemoryRepository
  sorter: MemorySorter
}

// Implements MemoryQueryExecutionService — composes every other piece
// this sprint built, in the exact order the brief lists: validate ->
// build + execute the specification (via the injected
// QueryableMemoryRepository) -> sort -> paginate -> assemble an
// immutable MemoryQueryResult. `totalCount` is measured *before*
// pagination (the full matching set), `returnedCount` *after* — both
// real counts, never estimated.
export class DefaultMemoryQueryExecutionService implements MemoryQueryExecutionService {
  constructor(private readonly dependencies: MemoryQueryExecutionServiceDependencies) {}

  async execute(query: MemoryQuery): Promise<MemoryQueryResult> {
    validateMemoryQuery(query)

    const specification = buildSpecificationFromQuery(query)
    const matches = await this.dependencies.repository.query(specification, query.userId)
    const sorted = this.dependencies.sorter.sort(matches, query.sortField, query.sortDirection)
    const paginated = paginateMemories(sorted, query.limit, query.offset)

    return {
      items: paginated,
      totalCount: sorted.length,
      returnedCount: paginated.length,
      appliedFilters: query,
      sortMetadata: { field: query.sortField, direction: query.sortDirection },
    }
  }
}

export function createMemoryQueryExecutionService(repository: QueryableMemoryRepository, sorter: MemorySorter = createMemorySorter()): MemoryQueryExecutionService {
  return new DefaultMemoryQueryExecutionService({ repository, sorter })
}
