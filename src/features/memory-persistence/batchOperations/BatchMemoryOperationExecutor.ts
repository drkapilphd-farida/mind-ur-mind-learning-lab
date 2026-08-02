import type { TransactionOperation } from '../transactionDomain'

// "Support atomic execution of: Create multiple memories, Update
// multiple memories, Archive multiple memories, Delete multiple
// memories." This executor applies exactly *one* operation — the
// "all-or-nothing" batch guarantee is the Transaction Coordinator's
// responsibility (looping over operations and invoking the Rollback
// Engine the moment one fails), not this executor's; this keeps
// "repository-specific business logic" (Section 3's exclusion) out of
// the coordinator while still letting this executor own the one thing
// it's actually responsible for: translating one operation into the
// right repository call.
export interface BatchMemoryOperationExecutor {
  apply(operation: TransactionOperation): Promise<void>
}
