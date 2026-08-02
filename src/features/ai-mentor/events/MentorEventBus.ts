import type { MentorEvent, MentorEventType } from '../types'

export type MentorEventListener<TType extends MentorEventType> = (event: MentorEvent<TType>) => void

// A real, typed pub/sub implementation — not a placeholder. Fully
// in-process (no network, no queue) since nothing in this sprint
// integrates a provider or persists events; a future real event
// pipeline (e.g. writing to `ai_events` — see
// docs/adr/0002-domain-layered-architecture.md's `ai` domain) would
// add a listener here, not replace this class. `on()` returns an
// unsubscribe function, the common ergonomic pattern for a future
// React `useEffect` cleanup.
export class MentorEventBus {
  private readonly listeners = new Map<MentorEventType, Set<(event: MentorEvent) => void>>()

  on<TType extends MentorEventType>(type: TType, listener: MentorEventListener<TType>): () => void {
    let set = this.listeners.get(type)
    if (!set) {
      set = new Set()
      this.listeners.set(type, set)
    }
    set.add(listener as (event: MentorEvent) => void)

    return () => {
      set?.delete(listener as (event: MentorEvent) => void)
    }
  }

  emit<TType extends MentorEventType>(event: MentorEvent<TType>): void {
    const set = this.listeners.get(event.type)
    if (!set) return
    for (const listener of set) listener(event)
  }

  listenerCount(type: MentorEventType): number {
    return this.listeners.get(type)?.size ?? 0
  }
}
