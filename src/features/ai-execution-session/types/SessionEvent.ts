import type { SessionState } from './SessionState'

// Immutable — every field `readonly`. One entry in a `SessionEventLog`
// — "Event logging" (§ Testing).
export type SessionEvent = {
  readonly state: SessionState
  readonly timestamp: string
  readonly detail: string
}
