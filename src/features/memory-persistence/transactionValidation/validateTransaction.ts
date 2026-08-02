import type { MemoryRepository } from '../contracts'
import type { MemoryTransaction, TransactionOperation } from '../transactionDomain'
import { getOperationTargetId } from '../transactionDomain'
import type { TransactionValidationIssue } from './TransactionValidationIssue'
import type { TransactionValidationResult } from './TransactionValidationResult'

function operationKey(operation: TransactionOperation): string {
  return `${operation.type}:${getOperationTargetId(operation)}`
}

// Depends only on the narrowest contract it actually needs (`load`),
// consistent with this feature's own layered `MemoryRepository` ->
// `QueryableMemoryRepository` -> `IndexedMemoryRepository` ->
// `TransactionalMemoryRepository` chain — every one of those satisfies
// `MemoryRepository`, so this function works unchanged regardless of
// which layer the caller passes in.
//
// Checks, in order:
// - invalid-state-transition: the transaction is already terminal
//   (`committed`/`rolledBack`) — re-validating/committing it again is
//   never legal.
// - duplicate-operation: the exact same (type, target id) pair appears
//   more than once in `operations`.
// - missing-memory-reference: an `update`/`archive`/`delete` operation
//   targets a memory id that doesn't exist.
// - concurrent-conflict: "deterministic checks only" — a purely
//   structural check over `operations` itself (no locks, no external
//   state): the same target id is touched by more than one *distinct*
//   operation type within one transaction (e.g. an `update` and a
//   `delete` both targeting the same memory).
//
// "Transaction integrity" is the result as a whole: `valid` is true
// iff none of the above found anything.
export async function validateTransaction(transaction: MemoryTransaction, repository: MemoryRepository): Promise<TransactionValidationResult> {
  const issues: TransactionValidationIssue[] = []

  if (transaction.state !== 'created' && transaction.state !== 'pending') {
    issues.push({
      type: 'invalid-state-transition',
      detail: `Transaction is already in a terminal state ("${transaction.state}") and cannot be validated for execution.`,
    })
  }

  const seenOperationKeys = new Set<string>()
  const typesByTargetId = new Map<string, Set<TransactionOperation['type']>>()

  for (const operation of transaction.operations) {
    const key = operationKey(operation)
    if (seenOperationKeys.has(key)) {
      issues.push({ type: 'duplicate-operation', detail: `Operation "${key}" appears more than once in this transaction.` })
    }
    seenOperationKeys.add(key)

    const targetId = getOperationTargetId(operation)
    const types = typesByTargetId.get(targetId) ?? new Set<TransactionOperation['type']>()
    types.add(operation.type)
    typesByTargetId.set(targetId, types)

    if (operation.type === 'update' || operation.type === 'archive' || operation.type === 'delete') {
      const targetIdForRef = operation.type === 'update' ? operation.memory.id : operation.memoryId
      const existing = await repository.load(targetIdForRef)
      if (!existing) {
        issues.push({
          type: 'missing-memory-reference',
          detail: `Operation "${key}" references memory id "${targetIdForRef}", which does not exist.`,
        })
      }
    }
  }

  for (const [targetId, types] of typesByTargetId) {
    if (types.size > 1) {
      issues.push({
        type: 'concurrent-conflict',
        detail: `Memory id "${targetId}" is targeted by more than one distinct operation type (${[...types].sort().join(', ')}) within this transaction.`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
