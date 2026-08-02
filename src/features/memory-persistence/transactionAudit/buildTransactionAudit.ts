import type { MemoryTransaction } from '../transactionDomain'
import type { TransactionValidationResult } from '../transactionValidation'
import type { TransactionAudit } from './TransactionAudit'

// Pure — assembles a diagnostic snapshot of a transaction's outcome.
// Takes the validation result as a parameter rather than recomputing
// it, so the audit always reflects the *exact* validation outcome the
// coordinator actually acted on, not a fresh (and potentially
// different, if repository state changed since) re-validation.
export function buildTransactionAudit(
  transaction: MemoryTransaction,
  validationResult: TransactionValidationResult,
  now: string,
): TransactionAudit {
  return {
    transactionId: transaction.id,
    timestamp: now,
    operations: transaction.operations,
    finalState: transaction.state,
    validationResult,
  }
}
