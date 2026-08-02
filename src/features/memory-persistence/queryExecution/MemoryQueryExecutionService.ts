import type { MemoryQuery, MemoryQueryResult } from '../query'

// "Validating queries, Executing specifications, Applying sorting,
// Applying pagination, Returning immutable results. No repository
// business logic leakage." — the one orchestration entry point for
// this sprint.
export interface MemoryQueryExecutionService {
  execute(query: MemoryQuery): Promise<MemoryQueryResult>
}
