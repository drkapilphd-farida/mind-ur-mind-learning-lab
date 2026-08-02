import type { TransactionId } from './TransactionId'
import type { TransactionMetadata } from './TransactionMetadata'
import type { TransactionOperation } from './TransactionOperation'
import type { TransactionState } from './TransactionState'

// The core immutable transaction model — every field `readonly`. Never
// mutated in place anywhere in this feature; every transformation
// (lifecycle transition, commit, rollback) returns a *new*
// MemoryTransaction value. Pure TypeScript, no framework dependency.
export type MemoryTransaction = {
  readonly id: TransactionId
  readonly state: TransactionState
  readonly operations: readonly TransactionOperation[]
  readonly metadata: TransactionMetadata
  readonly createdAt: string
  readonly updatedAt: string
}
