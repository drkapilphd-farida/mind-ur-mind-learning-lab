import type { SupportedProviderId } from '../types'
import type { ProviderCredentialResolver } from '../contracts'

// Implements ProviderCredentialResolver. Always, honestly `false` —
// "No API keys" is absolute this sprint, so there is genuinely nothing
// to report as present. Not a stub awaiting a TODO: a future real
// implementation checking a secrets manager replaces this class
// entirely (see the Sprint 6 report's "future provider activation
// process"), it doesn't get an "if real mode" branch bolted onto this
// one.
export class DefaultProviderCredentialResolver implements ProviderCredentialResolver {
  hasCredentials(_providerId: SupportedProviderId): boolean {
    return false
  }
}

export function createProviderCredentialResolver(): ProviderCredentialResolver {
  return new DefaultProviderCredentialResolver()
}
