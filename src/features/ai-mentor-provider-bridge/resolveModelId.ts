import type { AIProvider } from '@/features/ai-provider/contracts'
import type { ProviderSelectionCriteria } from '@/features/ai-provider/types'
import { NoModelAvailableError } from './NoModelAvailableError'

// Picks which of an already-resolved AIProvider's models an AIRequest
// should target — a small, local concern distinct from ai-provider's
// own ModelSelectionStrategy (Chunk 3, which picks a model *within* one
// adapter given an already-known modelId) and ProviderResolver (Chunk
// 2, which picks a *provider*). Here, nothing yet knows which model id
// to ask for — that's exactly what this resolves: prefer
// criteria.preferredModelId if the resolved provider actually declares
// it, otherwise fall back to the provider's first model.
export function resolveModelId(provider: AIProvider, criteria: ProviderSelectionCriteria): string {
  if (criteria.preferredModelId && provider.models.some((model) => model.id === criteria.preferredModelId)) {
    return criteria.preferredModelId
  }

  const [firstModel] = provider.models
  if (!firstModel) throw new NoModelAvailableError(provider.metadata.id)
  return firstModel.id
}
