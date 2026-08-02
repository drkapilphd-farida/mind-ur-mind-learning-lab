import type { ExecutionState } from './ExecutionState'

// Immutable — every field `readonly`. This engine's whole output — one
// terminal outcome per execution session. Exactly one of
// `failureReason`/`cancellationReason`/`timeoutReason` is non-null when
// `finalState` is the matching terminal state, all three `null` when
// `finalState === 'completed'`.
export type ExecutionResult = {
  readonly sessionId: string
  readonly finalState: ExecutionState
  readonly attemptCount: number
  readonly failureReason: string | null
  readonly cancellationReason: string | null
  readonly timeoutReason: string | null
}
