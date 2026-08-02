import type { SessionId } from '../domain'

// Thrown by SessionContextRepository.archive()/delete() (and
// orchestration operations built on top) when the given id doesn't
// exist — a real, catchable failure, never a silent no-op.
export class SessionContextNotFoundError extends Error {
  constructor(id: SessionId) {
    super(`No session context found with id: ${id}`)
    this.name = 'SessionContextNotFoundError'
  }
}
