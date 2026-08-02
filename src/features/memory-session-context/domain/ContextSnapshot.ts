import type { ContextEntry } from './ContextEntry'
import type { SessionId } from './SessionId'

// An immutable, point-in-time capture of a session's entries — never
// mutated after creation ("snapshots must be immutable"). `id` is the
// snapshot's own identity, distinct from the session it was captured
// from.
export type ContextSnapshot = {
  readonly id: string
  readonly sessionId: SessionId
  readonly entries: readonly ContextEntry[]
  readonly capturedAt: string
}
