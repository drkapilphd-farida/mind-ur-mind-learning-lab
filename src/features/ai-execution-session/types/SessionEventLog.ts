import type { SessionEvent } from './SessionEvent'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — an append-only record of every state the session
// has passed through. See `../eventLog/appendSessionEvent.ts`.
export type SessionEventLog = {
  readonly events: readonly SessionEvent[]
}
