import type { AIModel, AIModelCapabilities, ProviderMetadata } from '../types'
import type { AIProvider } from './AIProvider'

// A read-only query facade over a ProviderRegistry — "browse the
// catalog" (list every provider/model, find models by capability, find
// which provider owns a model) without exposing register/unregister.
// Interface segregation: a caller that only ever needs to *discover*
// providers (e.g. a future settings UI listing available models)
// depends on this, not the full mutable ProviderRegistry.
export interface ProviderDiscovery {
  listProviderMetadata(): readonly ProviderMetadata[]
  listAllModels(): readonly AIModel[]
  findModelsByCapability(capability: keyof AIModelCapabilities): readonly AIModel[]
  findProviderForModel(modelId: string): AIProvider | undefined
}
