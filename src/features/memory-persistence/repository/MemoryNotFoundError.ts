import type { MemoryId } from '../domain'

// Thrown by MemoryRepository.update()/delete() (and MemoryService
// operations built on top) when the given id doesn't exist — a real,
// catchable failure, never a silent no-op.
export class MemoryNotFoundError extends Error {
  constructor(id: MemoryId) {
    super(`No memory found with id: ${id}`)
    this.name = 'MemoryNotFoundError'
  }
}
