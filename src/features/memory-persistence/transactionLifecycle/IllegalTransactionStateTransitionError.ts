import type { TransactionState } from '../transactionDomain'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `committed` -> `rolledBack`) — a genuine domain failure, never
// silently applied.
export class IllegalTransactionStateTransitionError extends Error {
  constructor(from: TransactionState, to: TransactionState) {
    super(`Illegal transaction state transition: "${from}" -> "${to}"`)
    this.name = 'IllegalTransactionStateTransitionError'
  }
}
