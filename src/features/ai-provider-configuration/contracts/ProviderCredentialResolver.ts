import type { SupportedProviderId } from '../types'

// "Secure Provider Contract Interfaces" — the security property is the
// interface's shape itself: it can only ever answer "does this
// provider have credentials configured," never return the credential
// material. No method that could leak a secret exists anywhere on this
// contract, by construction — a future real implementation backed by a
// secrets manager still can't expose a key through this seam, because
// nothing calling through it ever asks for one.
export interface ProviderCredentialResolver {
  hasCredentials(providerId: SupportedProviderId): boolean
}
