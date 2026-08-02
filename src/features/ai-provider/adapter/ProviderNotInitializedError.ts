// Thrown by BaseProviderAdapter when generate()/estimateCost() is
// called before initialize() (or after shutdown()) — the Provider
// Lifecycle contract enforced as real, testable behavior rather than
// just an interface nobody checks.
export class ProviderNotInitializedError extends Error {
  constructor(providerId: string) {
    super(`Provider "${providerId}" has not been initialized — call initialize() before generate()/estimateCost().`)
    this.name = 'ProviderNotInitializedError'
  }
}
