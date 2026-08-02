import type { EventId, MemoryEvent } from '../domain'

// "Extend repository contracts to support: Store event, Retrieve
// events, Filter events, Archive events. Maintain backward
// compatibility." This feature is brand new, so "extend" means
// growing this codebase's family of repository contracts with one
// more — following the exact same Promise-based, framework-agnostic
// shape every other repository already uses (independently mirrored,
// not imported — "No cross-feature imports"). `archive()` is a
// mechanical persistence-layer operation, mirroring
// `SessionContextRepository.archive()`'s own precedent — it does not
// itself validate lifecycle legality; that lives in
// `dispatcher/DefaultEventDispatcher.ts`.
export interface EventRepository {
  store(event: MemoryEvent): Promise<void>
  retrieve(id: EventId): Promise<MemoryEvent | null>
  filter(predicate: (event: MemoryEvent) => boolean): Promise<readonly MemoryEvent[]>
  archive(id: EventId): Promise<MemoryEvent>
}
