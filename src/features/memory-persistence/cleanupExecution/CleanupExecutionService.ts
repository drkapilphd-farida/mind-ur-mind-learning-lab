import type { CleanupPlan } from '../retentionDomain'
import type { TransactionalMemoryRepository } from '../transactionalRepository'
import type { CleanupExecutionResult } from './CleanupExecutionResult'

// "Implement execution support for approved cleanup plans: Archive,
// Delete, Skip, Rollback on failure. Reuse the existing Transaction
// Engine where appropriate while preserving backward compatibility." —
// `execute()` translates a plan's non-skip candidates into
// `TransactionOperation`s and runs them through the given
// `TransactionalMemoryRepository`'s own `beginTransaction`/
// `commitTransaction` — "rollback on failure" is Sprint 17's
// TransactionCoordinator's own behavior, entirely reused, never
// reimplemented here.
export interface CleanupExecutionService {
  execute(plan: CleanupPlan, repository: TransactionalMemoryRepository, userId: string): Promise<CleanupExecutionResult>
}
