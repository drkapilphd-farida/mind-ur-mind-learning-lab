// Thrown by PersonalizationRepository.update()/delete() (and service
// operations built on top) when the given id doesn't exist — a real,
// catchable failure, never a silent no-op.
export class PersonalizationProfileNotFoundError extends Error {
  constructor(id: string) {
    super(`No personalization profile found with id: ${id}`)
    this.name = 'PersonalizationProfileNotFoundError'
  }
}
