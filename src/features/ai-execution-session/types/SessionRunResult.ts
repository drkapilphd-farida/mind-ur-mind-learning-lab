import type { AIExecutionSession } from './AIExecutionSession'
import type { SessionDiagnostics } from './SessionDiagnostics'
import type { SessionResult } from './SessionResult'
import type { SessionValidation } from './SessionValidation'

// Immutable — every field `readonly`. `SessionLifecycleCoordinator.run()`'s
// own output — always returned, never a thrown exception.
// `completionStatus` has 3 values (one per real terminal `SessionState`)
// — `result` is non-null only for `'completed'`; `failureReason` is
// non-null only for `'failed'`.
export type SessionRunResult = {
  readonly session: AIExecutionSession
  readonly completionStatus: 'completed' | 'failed' | 'cancelled'
  readonly result: SessionResult | null
  readonly failureReason: string | null
  readonly validationResult: SessionValidation
  readonly diagnostics: SessionDiagnostics
}
