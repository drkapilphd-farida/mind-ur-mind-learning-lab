import type { AdapterProviderId } from './AdapterProviderId'

// Immutable — every field `readonly`. `normalizeProviderResponse()`'s
// own output — a provider-neutral reshape of `ProviderAdapterRawResponse`
// (`outputText` → `text`). Input to `validateProviderResponse()` and
// `buildExecutionResult()`.
export type ProviderAdapterNormalizedResponse = {
  readonly providerId: AdapterProviderId
  readonly text: string
  readonly finishReason: 'stop' | 'length' | 'error'
  readonly modelUsed: string
}
