import type { EventMetadata, EventSource, EventType, MemoryEvent } from '../domain'

// "Register event, Dispatch event, Archive event, Replay event
// (deterministic only). No external messaging systems." — this
// dispatcher never integrates a real message broker/webhook/stream;
// "dispatch" here means transitioning an event to `published` and
// persisting that fact, nothing more. `replayEvent` is pure and
// synchronous — it deterministically re-derives a fresh, `created`-
// state event from a historical one's type/source/metadata/payload
// (same content, new identity), rather than pretending to "redeliver"
// to a consumer that doesn't exist in this scope.
export interface EventDispatcher {
  registerEvent(
    type: EventType,
    source: EventSource,
    metadata: EventMetadata,
    payload?: Readonly<Record<string, unknown>>,
  ): Promise<MemoryEvent>
  dispatchEvent(event: MemoryEvent): Promise<MemoryEvent>
  archiveEvent(event: MemoryEvent): Promise<MemoryEvent>
  replayEvent(event: MemoryEvent): MemoryEvent
}
