import type { TransactionId, TransactionOperation, TransactionState } from '../transactionDomain'
import type { TransactionValidationResult } from '../transactionValidation'

// Immutable — every field `readonly`. "Transaction ID, Timestamp,
// Operations executed, Final state, Validation results... Diagnostics
// only" — never consumed by any commit/rollback-path logic, only
// observed.
export type TransactionAudit = {
  readonly transactionId: TransactionId
  readonly timestamp: string
  readonly operations: readonly TransactionOperation[]
  readonly finalState: TransactionState
  readonly validationResult: TransactionValidationResult
}
