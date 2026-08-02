import type { CleanupPlan } from '../retentionDomain'
import type { TransactionOperation } from '../transactionDomain'
import type { TransactionalMemoryRepository } from '../transactionalRepository'
import type { CleanupExecutionResult } from './CleanupExecutionResult'
import type { CleanupExecutionService } from './CleanupExecutionService'

export type CleanupExecutionServiceDependencies = {
  source: string
}

function createDefaultDependencies(): CleanupExecutionServiceDependencies {
  return { source: 'memory-retention-cleanup-engine' }
}

// Implements CleanupExecutionService. `'skip'` candidates never become
// transaction operations — they're reported separately in `skipped`.
// An all-skip plan still commits an (empty) transaction, which
// `DefaultTransactionCoordinator` already handles correctly (a
// well-formed, trivially valid transaction with zero operations).
export class DefaultCleanupExecutionService implements CleanupExecutionService {
  constructor(private readonly dependencies: CleanupExecutionServiceDependencies) {}

  async execute(plan: CleanupPlan, repository: TransactionalMemoryRepository, userId: string): Promise<CleanupExecutionResult> {
    const skipped = plan.candidates.filter((candidate) => candidate.action === 'skip')

    const operations: readonly TransactionOperation[] = plan.candidates
      .filter((candidate) => candidate.action !== 'skip')
      .map((candidate) =>
        candidate.action === 'archive'
          ? { type: 'archive' as const, memoryId: candidate.memoryId }
          : { type: 'delete' as const, memoryId: candidate.memoryId },
      )

    const transaction = repository.beginTransaction(operations, { userId, source: this.dependencies.source })
    const committed = await repository.commitTransaction(transaction)

    return { plan, transaction: committed, skipped }
  }
}

export function createCleanupExecutionService(overrides: Partial<CleanupExecutionServiceDependencies> = {}): CleanupExecutionService {
  return new DefaultCleanupExecutionService({ ...createDefaultDependencies(), ...overrides })
}
