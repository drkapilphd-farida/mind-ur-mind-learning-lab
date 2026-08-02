import type { EventId } from '../domain'

// Thrown by EventRepository.archive() (and dispatcher operations built
// on top) when the given id doesn't exist — a real, catchable failure,
// never a silent no-op.
export class EventNotFoundError extends Error {
  constructor(id: EventId) {
    super(`No event found with id: ${id}`)
    this.name = 'EventNotFoundError'
  }
}
