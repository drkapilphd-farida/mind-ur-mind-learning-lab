import type { ActiveProviderId } from '../types'
import type { ProviderHealthChecker } from '../contracts'
import type { ProviderHealthStatus } from '@/features/ai-provider/types'
import type { Clock as ClockContract } from '@/features/ai-provider/contracts'
import { systemClock } from '@/features/ai-provider/adapters'

// Implements ProviderHealthChecker. Never makes a real network call
// ("No real requests") — 'mock' always honestly reports 'healthy';
// every real SupportedProviderId honestly reports 'unavailable' with a
// message explaining why (no adapter exists yet), never a fabricated
// 'healthy'. This is what structurally guarantees RuntimeProviderResolver
// can never select a real provider today, without hardcoding that
// guarantee into the resolver itself.
export class DefaultProviderHealthChecker implements ProviderHealthChecker {
  constructor(private readonly clock: ClockContract = systemClock) {}

  async checkHealth(providerId: ActiveProviderId): Promise<ProviderHealthStatus> {
    if (providerId === 'mock') {
      return { providerId: 'mock', state: 'healthy', checkedAt: this.clock.now() }
    }

    return {
      providerId,
      state: 'unavailable',
      checkedAt: this.clock.now(),
      message: `"${providerId}" has no real provider adapter implemented yet — Sprint 6 is infrastructure only.`,
    }
  }
}

export function createProviderHealthChecker(clock?: ClockContract): ProviderHealthChecker {
  return new DefaultProviderHealthChecker(clock)
}
