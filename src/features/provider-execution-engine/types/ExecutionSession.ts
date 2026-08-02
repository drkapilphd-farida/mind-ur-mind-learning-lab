import type { ExecutionContext } from './ExecutionContext'
import type { ExecutionPolicy } from './ExecutionPolicy'
import type { ExecutionRequest } from './ExecutionRequest'
import type { ExecutionState } from './ExecutionState'

// Immutable — every field `readonly`. One execution's own tracking
// record — `attemptCount` and `state` advance across the pipeline run,
// each advance producing a new session value, never a mutation.
export type ExecutionSession = {
  readonly id: string
  readonly request: ExecutionRequest
  readonly context: ExecutionContext
  readonly policy: ExecutionPolicy
  readonly state: ExecutionState
  readonly attemptCount: number
}
