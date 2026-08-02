import { PROVIDER_ADAPTER_DEFINITIONS } from '../definitions'
import type { AdapterProviderId } from '../types'
import { DefaultProviderAdapter } from './DefaultProviderAdapter'
import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'
import { ProviderAdapterException } from './ProviderAdapterException'
import type { ProviderAdapterFactory } from './ProviderAdapterFactory'

function isKnownProviderId(providerId: string): providerId is AdapterProviderId {
  return Object.prototype.hasOwnProperty.call(PROVIDER_ADAPTER_DEFINITIONS, providerId)
}

// Deterministic factory selection — no dynamic loading, no reflection,
// no DI framework: a plain lookup into the fixed
// `PROVIDER_ADAPTER_DEFINITIONS` catalog, wrapped in the one generic
// `DefaultProviderAdapter`.
export class DefaultProviderAdapterFactory implements ProviderAdapterFactory {
  create(providerId: string): DeterministicProviderAdapter {
    if (!isKnownProviderId(providerId)) {
      throw new ProviderAdapterException(providerId)
    }

    return new DefaultProviderAdapter(PROVIDER_ADAPTER_DEFINITIONS[providerId])
  }
}

export function createProviderAdapterFactory(): ProviderAdapterFactory {
  return new DefaultProviderAdapterFactory()
}
