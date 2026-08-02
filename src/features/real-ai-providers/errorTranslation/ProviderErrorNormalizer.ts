import type { NormalizedProviderError } from './NormalizedProviderError'

export interface ProviderErrorNormalizer {
  normalize(error: unknown, providerId: string): NormalizedProviderError
}
