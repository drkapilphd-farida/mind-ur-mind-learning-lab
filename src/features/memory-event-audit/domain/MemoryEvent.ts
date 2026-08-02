import type { EventId } from './EventId'
import type { EventLifecycleState } from './EventLifecycleState'
import type { EventMetadata } from './EventMetadata'
import type { EventSource } from './EventSource'
import type { EventType } from './EventType'

// The core immutable event model — every field `readonly`. Never
// mutated in place anywhere in this feature; every transformation
// (lifecycle transition, replay) returns a *new* MemoryEvent value.
// `payload` is a generic, provider-agnostic bag for whatever extra
// context a caller wants to attach — the same `Record<string,
// unknown>` idiom `@/features/memory-persistence`'s own
// `SerializedMemory.payload` already uses, independently redeclared
// here rather than imported ("No cross-feature imports").
export type MemoryEvent = {
  readonly id: EventId
  readonly type: EventType
  readonly source: EventSource
  readonly state: EventLifecycleState
  readonly metadata: EventMetadata
  readonly payload: Readonly<Record<string, unknown>>
  readonly createdAt: string
  readonly updatedAt: string
}
