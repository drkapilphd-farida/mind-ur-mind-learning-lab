import type { EventMetadata, EventSource, EventType, MemoryEvent } from '../domain'
import type { Clock, EventRepository, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { createEventRepository } from '../repository'
import { moveEventToPublished, moveEventToArchived, moveEventToRecorded } from '../lifecycle'
import type { EventDispatcher } from './EventDispatcher'

export type EventDispatcherDependencies = {
  repository: EventRepository
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): EventDispatcherDependencies {
  return { repository: createEventRepository(), clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements EventDispatcher.
export class DefaultEventDispatcher implements EventDispatcher {
  constructor(private readonly dependencies: EventDispatcherDependencies) {}

  async registerEvent(
    type: EventType,
    source: EventSource,
    metadata: EventMetadata,
    payload: Readonly<Record<string, unknown>> = {},
  ): Promise<MemoryEvent> {
    const now = this.dependencies.clock.now()

    const created: MemoryEvent = {
      id: this.dependencies.idGenerator.generate(),
      type,
      source,
      state: 'created',
      metadata,
      payload,
      createdAt: now,
      updatedAt: now,
    }

    const recorded = moveEventToRecorded(created, now)
    await this.dependencies.repository.store(recorded)
    return recorded
  }

  async dispatchEvent(event: MemoryEvent): Promise<MemoryEvent> {
    const published = moveEventToPublished(event, this.dependencies.clock.now())
    await this.dependencies.repository.store(published)
    return published
  }

  async archiveEvent(event: MemoryEvent): Promise<MemoryEvent> {
    // Validate legality via the same transition graph every other
    // lifecycle change uses (throws if `event.state` cannot legally
    // move to `archived`); the returned value is discarded because the
    // *mechanical* write is delegated to the repository's own
    // `archive()` — the same "validate here, persist there" split
    // established by every earlier sprint's `archive()`-capable
    // repository.
    moveEventToArchived(event, this.dependencies.clock.now())
    return this.dependencies.repository.archive(event.id)
  }

  replayEvent(event: MemoryEvent): MemoryEvent {
    const now = this.dependencies.clock.now()
    return {
      id: this.dependencies.idGenerator.generate(),
      type: event.type,
      source: event.source,
      state: 'created',
      metadata: event.metadata,
      payload: event.payload,
      createdAt: now,
      updatedAt: now,
    }
  }
}

export function createEventDispatcher(overrides: Partial<EventDispatcherDependencies> = {}): EventDispatcher {
  return new DefaultEventDispatcher({ ...createDefaultDependencies(), ...overrides })
}
