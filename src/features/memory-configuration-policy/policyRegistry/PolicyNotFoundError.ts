// Thrown by PolicyRegistry.overridePolicy() when the given profile id
// isn't registered — a real, catchable failure, never a silent no-op.
export class PolicyNotFoundError extends Error {
  constructor(profileId: string) {
    super(`No policy registered with id: ${profileId}`)
    this.name = 'PolicyNotFoundError'
  }
}
