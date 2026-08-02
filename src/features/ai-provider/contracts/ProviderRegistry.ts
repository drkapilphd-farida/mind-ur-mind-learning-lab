import type { AIModelCapabilities } from '../types'
import type { AIProvider } from './AIProvider'

// The catalog every registered AIProvider lives in — `registry/`
// implements this with a plain in-memory Map, no database. `register`
// is idempotent-by-id (registering the same providerId twice replaces
// the entry) rather than throwing, so a future hot-reload of provider
// configuration doesn't need special-case handling.
export interface ProviderRegistry {
  register(provider: AIProvider): void
  unregister(providerId: string): void
  get(providerId: string): AIProvider | undefined
  list(): readonly AIProvider[]
  findByCapability(capability: keyof AIModelCapabilities): readonly AIProvider[]
}
