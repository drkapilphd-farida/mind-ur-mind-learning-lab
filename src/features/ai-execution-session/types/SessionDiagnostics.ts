import type { SessionState } from './SessionState'
import type { SessionValidation } from './SessionValidation'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — no naming collision found, used brief-exact.
export type SessionDiagnostics = {
  readonly sessionId: string
  readonly finalState: SessionState
  readonly eventCount: number
  readonly validationResult: SessionValidation
  readonly providerId: string | null
  readonly modelId: string | null
}
