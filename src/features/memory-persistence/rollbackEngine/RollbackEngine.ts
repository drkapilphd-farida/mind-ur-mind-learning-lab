import type { TransactionOperation } from '../transactionDomain'
import type { MemorySnapshot } from './MemorySnapshot'

// "Restore previous state, Reverse index updates, Restore lifecycle
// state, Validate rollback integrity. No partial commits." Every
// write this engine performs goes through the same injected
// `MemoryRepository`-shaped dependency the coordinator itself was
// given — when that's an `IndexedMemoryRepository`, "reverse index
// updates" and "restore lifecycle state" both fall out for free,
// because a full `Memory` value (lifecycle field included) written via
// `save()` re-triggers the exact same indexing side effect a normal
// write would.
export interface RollbackEngine {
  captureSnapshot(operations: readonly TransactionOperation[]): Promise<MemorySnapshot>
  restoreSnapshot(snapshot: MemorySnapshot): Promise<void>
  validateRollbackIntegrity(snapshot: MemorySnapshot): Promise<boolean>
}
