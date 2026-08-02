import type { AIModel } from '../types'

// Selects the AIModel a single adapter should use for a given
// modelId, from that adapter's own model list — distinct from Chunk
// 2's ProviderResolver, which picks a *provider* across the whole
// registry. The default strategy is an exact-id lookup; a future
// strategy could add alias resolution or an in-provider fallback
// without BaseProviderAdapter ever changing.
export interface ModelSelectionStrategy {
  selectModel(models: readonly AIModel[], modelId: string, providerId: string): AIModel
}
