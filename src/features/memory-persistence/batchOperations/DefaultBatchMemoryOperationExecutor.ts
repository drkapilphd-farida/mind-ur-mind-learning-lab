import type { Clock, MemoryRepository } from '../contracts'
import { systemClock } from '../adapters'
import { moveMemoryToArchived } from '../lifecycle'
import { MemoryNotFoundError } from '../repository'
import type { TransactionOperation } from '../transactionDomain'
import type { BatchMemoryOperationExecutor } from './BatchMemoryOperationExecutor'

export type BatchMemoryOperationExecutorDependencies = {
  repository: MemoryRepository
  clock: Clock
}

// Implements BatchMemoryOperationExecutor. `create`/`update`/`delete`
// map directly onto the repository's own primitives; `archive` is the
// one operation that needs extra work — the repository contract has no
// `archive()` verb of its own (only `IndexedMemoryRepository`'s
// underlying persistence does, and only for a *different* domain —
// see `indexedRepository/`), so this loads the current memory, runs it
// through the same `moveMemoryToArchived` lifecycle transition
// `DefaultMemoryService` itself uses, and persists the result via
// `update()`.
export class DefaultBatchMemoryOperationExecutor implements BatchMemoryOperationExecutor {
  constructor(private readonly dependencies: BatchMemoryOperationExecutorDependencies) {}

  async apply(operation: TransactionOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await this.dependencies.repository.save(operation.memory)
        return
      case 'update':
        await this.dependencies.repository.update(operation.memory)
        return
      case 'delete':
        await this.dependencies.repository.delete(operation.memoryId)
        return
      case 'archive': {
        const existing = await this.dependencies.repository.load(operation.memoryId)
        if (!existing) throw new MemoryNotFoundError(operation.memoryId)
        const archived = moveMemoryToArchived(existing, this.dependencies.clock.now())
        await this.dependencies.repository.update(archived)
        return
      }
    }
  }
}

// `repository` has no sensible standalone default (an executor
// disconnected from the coordinator's own repository would be
// useless), so it's a required parameter; `clock` defaults like every
// other clock dependency in this feature.
export function createBatchMemoryOperationExecutor(repository: MemoryRepository, clock: Clock = systemClock): BatchMemoryOperationExecutor {
  return new DefaultBatchMemoryOperationExecutor({ repository, clock })
}
