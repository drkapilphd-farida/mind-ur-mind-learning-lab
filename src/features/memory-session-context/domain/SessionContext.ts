import type { ContextEntry } from './ContextEntry'
import type { ContextMetadata } from './ContextMetadata'
import type { SessionContextLifecycleState } from './SessionContextLifecycleState'
import type { SessionId } from './SessionId'

// The core immutable domain model — every field `readonly`. Never
// mutated in place anywhere in this feature; every transformation
// (lifecycle transition, context update, snapshot restore) returns a
// *new* SessionContext value. Pure TypeScript, no framework
// dependency — this type has no relation to any Supabase row shape,
// React prop, or other framework concern.
export type SessionContext = {
  readonly id: SessionId
  readonly lifecycle: SessionContextLifecycleState
  readonly entries: readonly ContextEntry[]
  readonly metadata: ContextMetadata
  readonly createdAt: string
  readonly updatedAt: string
}
