// Thrown only if MENTOR_PERSONAS itself were ever missing one of the 6
// ids this engine's own selection logic depends on — genuinely
// unreachable with the catalog as shipped, but a real, catchable
// failure rather than a silent `undefined` propagating into a prompt.
export class UnknownMentorPersonaError extends Error {
  constructor(id: string) {
    super(`No mentor persona registered with id: ${id}`)
    this.name = 'UnknownMentorPersonaError'
  }
}
