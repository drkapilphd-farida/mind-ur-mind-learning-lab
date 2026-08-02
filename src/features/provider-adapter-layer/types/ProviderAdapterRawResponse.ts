import type { AdapterProviderId } from './AdapterProviderId'

// Immutable — every field `readonly`. A deterministic, caller-supplied
// stand-in for "what a provider would eventually return" — never
// fetched, never awaited, same "the caller supplies the outcome"
// determinism as `provider-execution-engine`'s own
// `ExecutionAttemptOutcome`. Input to `normalizeProviderResponse()`.
export type ProviderAdapterRawResponse = {
  readonly providerId: AdapterProviderId
  readonly outputText: string
  readonly finishReason: 'stop' | 'length' | 'error'
  readonly modelUsed: string
}
