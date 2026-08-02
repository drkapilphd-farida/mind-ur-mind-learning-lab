import type { ProviderSelectionCriteria } from '../types'

// Thrown by ProviderResolver.resolve() when no candidate satisfies the
// given criteria — a genuine, specific error rather than silently
// returning undefined. Moved here (from factory/, Chunk 1) alongside the
// resolution algorithm that actually raises it; re-exported from
// factory/ too, since ProviderFactory.resolve() is still the public
// entry point most callers see this error from.
export class NoMatchingProviderError extends Error {
  constructor(criteria: ProviderSelectionCriteria) {
    super(`No registered provider matches the given selection criteria: ${JSON.stringify(criteria)}`)
    this.name = 'NoMatchingProviderError'
  }
}
