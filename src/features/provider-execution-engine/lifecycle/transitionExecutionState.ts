import type { ExecutionState } from '../types'
import { IllegalExecutionTransitionError } from './IllegalExecutionTransitionError'

// The legal transition graph — "ExecutionLifecycle" (§ Responsibilities).
// `pending -> preparing -> ready -> executing`, `executing` fans out to
// every terminal-or-retry outcome, `retrying` loops back to `executing`
// for the next attempt, and **every non-terminal state can also
// transition to `cancelled`** — manual/safety cancellation can happen
// at any point mid-flight, not just from one specific state.
// `completed`/`cancelled`/`failed`/`timeout` are all terminal. Pure —
// same idiom as
// `personalization-engine/lifecycle/transitionPersonalizationLifecycle.ts`.
const ALLOWED_TRANSITIONS: Record<ExecutionState, readonly ExecutionState[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled', 'failed'],
  ready: ['executing', 'cancelled'],
  executing: ['completed', 'failed', 'timeout', 'retrying', 'cancelled'],
  retrying: ['executing', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: [],
  timeout: [],
}

export function transitionExecutionState(from: ExecutionState, to: ExecutionState): ExecutionState {
  const allowed = ALLOWED_TRANSITIONS[from]
  if (!allowed.includes(to)) throw new IllegalExecutionTransitionError(from, to)
  return to
}
