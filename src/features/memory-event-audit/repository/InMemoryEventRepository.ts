import type { EventId, MemoryEvent } from '../domain'
import type { Clock, EventRepository } from '../contracts'
import { systemClock } from '../adapters'
import { EventNotFoundError } from './EventNotFoundError'

// Implements EventRepository — this sprint's one shipped
// implementation, entirely in-memory (a private Map). Every method is
// `async` even though nothing here actually awaits, so a future real
// implementation is a pure swap, never a signature change. `archive()`
// is mechanical only — see `EventRepository.ts`'s own note on why
// legality validation lives in the dispatcher, not here.
export class InMemoryEventRepository implements EventRepository {
  private readonly records = new Map<EventId, MemoryEvent>()

  constructor(private readonly clock: Clock) {}

  async store(event: MemoryEvent): Promise<void> {
    this.records.set(event.id, event)
  }

  async retrieve(id: EventId): Promise<MemoryEvent | null> {
    return this.records.get(id) ?? null
  }

  async filter(predicate: (event: MemoryEvent) => boolean): Promise<readonly MemoryEvent[]> {
    return [...this.records.values()].filter(predicate)
  }

  async archive(id: EventId): Promise<MemoryEvent> {
    const existing = this.records.get(id)
    if (!existing) throw new EventNotFoundError(id)

    const archived: MemoryEvent = { ...existing, state: 'archived', updatedAt: this.clock.now() }
    this.records.set(id, archived)
    return archived
  }
}

export function createEventRepository(clock: Clock = systemClock): EventRepository {
  return new InMemoryEventRepository(clock)
}
