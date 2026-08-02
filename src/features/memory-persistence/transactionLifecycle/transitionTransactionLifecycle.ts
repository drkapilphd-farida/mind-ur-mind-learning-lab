import type { MemoryTransaction, TransactionState } from '../transactionDomain'
import { IllegalTransactionStateTransitionError } from './IllegalTransactionStateTransitionError'

// The legal transition graph: Created -> Pending -> Committed,
// Pending -> Failed, Failed -> Rolled Back (the Rollback Engine's own
// target — Section 5, "for failed operations"), and both Created and
// Pending -> Rolled Back directly ("Cancel transaction", Section 3 —
// cancelling before/while a transaction is in flight is, functionally,
// a rollback with nothing yet committed). Committed and Rolled Back
// are both terminal — this engine never implements compensating
// transactions against an already-committed transaction ("Do NOT
// implement: Distributed transactions"). Pure — never mutates the
// given MemoryTransaction, always returns a new one with `updatedAt`
// set to the given `now`.
const ALLOWED_TRANSITIONS: Record<TransactionState, readonly TransactionState[]> = {
  created: ['pending', 'rolledBack'],
  pending: ['committed', 'failed', 'rolledBack'],
  committed: [],
  failed: ['rolledBack'],
  rolledBack: [],
}

export function transitionTransactionLifecycle(
  transaction: MemoryTransaction,
  to: TransactionState,
  now: string,
): MemoryTransaction {
  const allowed = ALLOWED_TRANSITIONS[transaction.state]
  if (!allowed.includes(to)) throw new IllegalTransactionStateTransitionError(transaction.state, to)
  return { ...transaction, state: to, updatedAt: now }
}

// Named helpers for the transitions the coordinator actually drives —
// deliberately distinct names from the coordinator's own method names
// (`commitTransaction`, `rollbackTransaction`, `cancelTransaction`) to
// keep every call site unambiguous about which one it means.
export function moveTransactionToPending(transaction: MemoryTransaction, now: string): MemoryTransaction {
  return transitionTransactionLifecycle(transaction, 'pending', now)
}

export function moveTransactionToCommitted(transaction: MemoryTransaction, now: string): MemoryTransaction {
  return transitionTransactionLifecycle(transaction, 'committed', now)
}

export function moveTransactionToFailed(transaction: MemoryTransaction, now: string): MemoryTransaction {
  return transitionTransactionLifecycle(transaction, 'failed', now)
}

export function moveTransactionToRolledBack(transaction: MemoryTransaction, now: string): MemoryTransaction {
  return transitionTransactionLifecycle(transaction, 'rolledBack', now)
}
