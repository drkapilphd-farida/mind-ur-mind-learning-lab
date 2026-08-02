import type { MemoryRepository } from '../contracts'
import type { TransactionOperation } from '../transactionDomain'
import { getOperationTargetId } from '../transactionDomain'
import type { MemorySnapshot } from './MemorySnapshot'
import { memoriesEqual } from './memoriesEqual'
import type { RollbackEngine } from './RollbackEngine'

export type RollbackEngineDependencies = {
  repository: MemoryRepository
}

// Implements RollbackEngine.
//
// `captureSnapshot` loads the *current* (pre-transaction-attempt)
// value of every distinct memory id the given operations target,
// deduplicated so a target touched by more than one operation is only
// read once.
//
// `restoreSnapshot` writes each record's `before` value back via
// `save()` (a safe upsert regardless of whether the record currently
// exists); for a `before: null` record it deletes the memory only if
// it currently exists — this makes restoration safe to call even when
// only *some* of a transaction's operations were ever applied (the
// exact situation after a mid-commit failure), never throwing on an id
// that was never actually created.
export class DefaultRollbackEngine implements RollbackEngine {
  constructor(private readonly dependencies: RollbackEngineDependencies) {}

  async captureSnapshot(operations: readonly TransactionOperation[]): Promise<MemorySnapshot> {
    const targetIds = [...new Set(operations.map((operation) => getOperationTargetId(operation)))]
    const records = await Promise.all(
      targetIds.map(async (memoryId) => ({ memoryId, before: await this.dependencies.repository.load(memoryId) })),
    )
    return records
  }

  async restoreSnapshot(snapshot: MemorySnapshot): Promise<void> {
    for (const record of snapshot) {
      if (record.before !== null) {
        await this.dependencies.repository.save(record.before)
        continue
      }

      const current = await this.dependencies.repository.load(record.memoryId)
      if (current) await this.dependencies.repository.delete(record.memoryId)
    }
  }

  async validateRollbackIntegrity(snapshot: MemorySnapshot): Promise<boolean> {
    for (const record of snapshot) {
      const current = await this.dependencies.repository.load(record.memoryId)
      if (!memoriesEqual(current, record.before)) return false
    }
    return true
  }
}

export function createRollbackEngine(repository: MemoryRepository): RollbackEngine {
  return new DefaultRollbackEngine({ repository })
}
