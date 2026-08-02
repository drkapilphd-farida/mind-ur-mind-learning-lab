import type { AIExecutionSessionContext } from './AIExecutionSessionContext'
import type { SessionEventLog } from './SessionEventLog'
import type { SessionMetadata } from './SessionMetadata'
import type { SessionState } from './SessionState'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — the core session entity/snapshot. Each state
// transition produces a *new* value, never a mutation.
export type AIExecutionSession = {
  readonly id: string
  readonly context: AIExecutionSessionContext
  readonly state: SessionState
  readonly metadata: SessionMetadata
  readonly eventLog: SessionEventLog
}
