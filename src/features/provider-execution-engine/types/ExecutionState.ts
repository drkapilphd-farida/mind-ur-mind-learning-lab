// "Pending, Preparing, Ready, Executing, Completed, Cancelled, Failed,
// Timeout, Retrying" — the Sprint 35 brief's own "Execution States"
// list, verbatim. `completed`/`cancelled`/`failed`/`timeout` are
// terminal — see `../lifecycle/transitionExecutionState.ts`.
export type ExecutionState = 'pending' | 'preparing' | 'ready' | 'executing' | 'completed' | 'cancelled' | 'failed' | 'timeout' | 'retrying'
