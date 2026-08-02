import type { ActiveProviderId } from '../types'
import type { ProviderHealthStatus } from '@/features/ai-provider/types'

// "Provider Health Interface" — reuses ai-provider's own
// ProviderHealthStatus shape (Sprint 5, read-only). Checking a
// SupportedProviderId's health never makes a real network call this
// sprint ("No real requests") — DefaultProviderHealthChecker reports
// every real provider honestly 'unavailable' ("no real adapter
// implemented yet"), never a fabricated 'healthy'.
export interface ProviderHealthChecker {
  checkHealth(providerId: ActiveProviderId): Promise<ProviderHealthStatus>
}
