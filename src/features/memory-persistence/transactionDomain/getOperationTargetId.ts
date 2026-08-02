import type { MemoryId } from '../domain'
import type { TransactionOperation } from './TransactionOperation'

// Pure — the memory id a given operation targets, regardless of which
// variant it is. Shared by `rollbackEngine/` (snapshot capture),
// `transactionValidation/` (duplicate/conflict detection), and
// `batchOperations/` (nothing else needs to branch on this).
export function getOperationTargetId(operation: TransactionOperation): MemoryId {
  switch (operation.type) {
    case 'create':
    case 'update':
      return operation.memory.id
    case 'archive':
    case 'delete':
      return operation.memoryId
  }
}
