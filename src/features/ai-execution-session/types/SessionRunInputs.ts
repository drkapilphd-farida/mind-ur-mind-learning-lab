import type { AIExecutionSessionContext } from './AIExecutionSessionContext'
import type { SessionExecutionOutcome } from './SessionExecutionOutcome'

// Immutable — every field `readonly`. `SessionLifecycleCoordinator.run()`'s
// own input. `cancellationRequested` is checked immediately after
// session creation/registration and short-circuits to `cancelled`
// before any request/response tracking happens — no timers, no
// mid-run pausing.
export type SessionRunInputs = {
  readonly sessionId: string
  readonly context: AIExecutionSessionContext
  readonly outcome: SessionExecutionOutcome
  readonly cancellationRequested: boolean
}
