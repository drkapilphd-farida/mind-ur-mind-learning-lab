// The Sprint 17 brief's own Lifecycle example, verbatim (`Rolled Back`
// -> `rolledBack`). See
// `transactionLifecycle/transitionTransactionLifecycle.ts` for the
// exact legal transition graph, including how "Cancel transaction"
// (Section 3) and "Rollback Engine" (Section 5) both land here.
export type TransactionState = 'created' | 'pending' | 'committed' | 'rolledBack' | 'failed'
