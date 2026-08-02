// Thrown only by `ProviderAdapterFactory.create()` for an unrecognized
// provider id — a genuinely unrecoverable configuration error, not a
// recoverable validation result. Matches this exact codebase's own
// precedent for "no such thing exists" failures (`ai-provider`'s
// `NoMatchingProviderError`, `ProviderNotInitializedError`,
// `UnknownModelError`).
export class ProviderAdapterException extends Error {
  constructor(public readonly providerId: string) {
    super(`No provider adapter definition exists for provider id "${providerId}".`)
    this.name = 'ProviderAdapterException'
  }
}
