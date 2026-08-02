// Thrown when a resolved AIProvider (from ai-provider's ProviderFactory)
// declares zero models — genuinely unreachable with this bridge's own
// default wiring (its one registered provider always has one model),
// but a real, catchable failure if a caller injects a misconfigured
// provider via dependency injection, not a stand-in for "not
// implemented yet."
export class NoModelAvailableError extends Error {
  constructor(providerId: string) {
    super(`Provider "${providerId}" has no models available to route an AI Mentor request to.`)
    this.name = 'NoModelAvailableError'
  }
}
