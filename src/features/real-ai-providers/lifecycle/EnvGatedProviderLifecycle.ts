import type { ProviderLifecycle } from '@/features/ai-provider/contracts'
import { MissingProviderConfigurationError } from '../errors'

// Implements ai-provider's ProviderLifecycle contract (Sprint 5, Chunk
// 3, unmodified). `initialize()` only ever checks that its required
// environment variable is *present* — it never makes a network call
// ("no real API requests should occur in development or tests" holds
// even when a real adapter's own lifecycle is exercised). Throws
// MissingProviderConfigurationError rather than silently staying
// not-ready, so a caller (RuntimeProviderSwitcher) gets a real, typed
// reason to fall back to mock.
export class EnvGatedProviderLifecycle implements ProviderLifecycle {
  private ready = false

  constructor(
    private readonly providerId: string,
    private readonly requiredEnvVar: string,
  ) {}

  async initialize(): Promise<void> {
    if (!process.env[this.requiredEnvVar]) {
      throw new MissingProviderConfigurationError(this.providerId, this.requiredEnvVar)
    }
    this.ready = true
  }

  async shutdown(): Promise<void> {
    this.ready = false
  }

  isReady(): boolean {
    return this.ready
  }
}

export function createEnvGatedProviderLifecycle(providerId: string, requiredEnvVar: string): ProviderLifecycle {
  return new EnvGatedProviderLifecycle(providerId, requiredEnvVar)
}
