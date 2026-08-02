// Thrown only if RuntimeProviderResolver resolved to a providerId that
// isn't actually registered in the switcher's own registry — genuinely
// unreachable with the default wiring (which always registers 'mock',
// and the resolver can only ever select a provider present in its own
// configuration), but a real, catchable failure rather than a silent
// `undefined` propagating into a caller expecting an AIProvider.
export class NoRegisteredProviderError extends Error {
  constructor(providerId: string) {
    super(`RuntimeProviderResolver resolved to "${providerId}", but no provider with that id is registered.`)
    this.name = 'NoRegisteredProviderError'
  }
}
