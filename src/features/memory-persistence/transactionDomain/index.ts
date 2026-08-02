// Memory Transaction Engine™ domain models (Sprint 17). Pure
// TypeScript, no framework dependency, intra-feature only (imports
// `Memory`/`MemoryId` from `../domain` — the same feature, not a
// cross-feature import).

export type { TransactionId } from './TransactionId'
export type { TransactionState } from './TransactionState'
export type { TransactionOperation } from './TransactionOperation'
export { getOperationTargetId } from './getOperationTargetId'
export type { TransactionMetadata } from './TransactionMetadata'
export type { MemoryTransaction } from './MemoryTransaction'
