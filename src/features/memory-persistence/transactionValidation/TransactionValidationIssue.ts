// "Duplicate operations, Invalid state transitions, Missing memory
// references, Concurrent operation conflicts" — the Sprint 17 brief's
// own four named validation checks (its fifth, "Transaction
// integrity", is the overall result — see
// `TransactionValidationResult.ts`).
export type TransactionValidationIssueType =
  | 'duplicate-operation'
  | 'invalid-state-transition'
  | 'missing-memory-reference'
  | 'concurrent-conflict'

// Immutable — every field `readonly`.
export type TransactionValidationIssue = {
  readonly type: TransactionValidationIssueType
  readonly detail: string
}
