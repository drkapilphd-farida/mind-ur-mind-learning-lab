import type { ActiveProviderId } from '@/features/ai-provider-configuration/types'
import type { ProviderCredentialResolver, ProviderHealthChecker } from '@/features/ai-provider-configuration/contracts'
import type { ProviderHealthStatus } from '@/features/ai-provider/types'
import type { Clock } from '@/features/ai-provider/contracts'
import { systemClock } from '@/features/ai-provider/adapters'
import { createEnvProviderCredentialResolver } from '../credentials'

// Implements ai-provider-configuration's ProviderHealthChecker contract
// (Sprint 6, unmodified). Deliberately never makes a real network call
// to "ping" a provider — "no real API requests should occur in
// development or tests," and a health check that fired on every
// RuntimeProviderResolver.resolve() call would violate that even in
// production. "Healthy" here means exactly "credentials are present" —
// composed from EnvProviderCredentialResolver rather than
// re-implementing the same env-var check.
export class ConfiguredProviderHealthChecker implements ProviderHealthChecker {
  constructor(
    private readonly credentialResolver: ProviderCredentialResolver = createEnvProviderCredentialResolver(),
    private readonly clock: Clock = systemClock,
  ) {}

  async checkHealth(providerId: ActiveProviderId): Promise<ProviderHealthStatus> {
    if (providerId === 'mock') {
      return { providerId: 'mock', state: 'healthy', checkedAt: this.clock.now() }
    }

    const hasCredentials = this.credentialResolver.hasCredentials(providerId)
    if (!hasCredentials) {
      return {
        providerId,
        state: 'unavailable',
        checkedAt: this.clock.now(),
        message: `"${providerId}" has no credentials configured.`,
      }
    }

    return {
      providerId,
      state: 'healthy',
      checkedAt: this.clock.now(),
      message: `"${providerId}" is configured (credentials present). No live network check was performed.`,
    }
  }
}

export function createConfiguredProviderHealthChecker(credentialResolver?: ProviderCredentialResolver, clock?: Clock): ProviderHealthChecker {
  return new ConfiguredProviderHealthChecker(credentialResolver, clock)
}
