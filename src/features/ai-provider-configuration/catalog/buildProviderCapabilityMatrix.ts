import type { AIModelCapabilities } from '@/features/ai-provider/types'
import type { ModelRegistryEntry, ProviderCapabilityMatrix } from '../types'
import { SUPPORTED_PROVIDERS } from './SUPPORTED_PROVIDERS'

const NO_CAPABILITIES: AIModelCapabilities = {
  chat: false,
  vision: false,
  imageGeneration: false,
  audio: false,
  reasoning: false,
  toolCalling: false,
  jsonMode: false,
  structuredOutput: false,
  streaming: false,
  multimodal: false,
}

function unionCapabilities(a: AIModelCapabilities, b: AIModelCapabilities): AIModelCapabilities {
  return {
    chat: a.chat || b.chat,
    vision: a.vision || b.vision,
    imageGeneration: a.imageGeneration || b.imageGeneration,
    audio: a.audio || b.audio,
    reasoning: a.reasoning || b.reasoning,
    toolCalling: a.toolCalling || b.toolCalling,
    jsonMode: a.jsonMode || b.jsonMode,
    structuredOutput: a.structuredOutput || b.structuredOutput,
    streaming: a.streaming || b.streaming,
    multimodal: a.multimodal || b.multimodal,
  }
}

// The "Provider Capability Matrix" — derived, not hand-maintained, from
// the AI Model Registry: a provider "supports" a capability if any one
// of its catalog models declares it. Deriving it this way means the
// matrix can never silently drift out of sync with the registry it
// describes.
export function buildProviderCapabilityMatrix(models: readonly ModelRegistryEntry[]): ProviderCapabilityMatrix {
  const matrix = {} as { -readonly [K in keyof ProviderCapabilityMatrix]: ProviderCapabilityMatrix[K] }

  for (const provider of SUPPORTED_PROVIDERS) {
    const providerModels = models.filter((model) => model.providerId === provider.id)
    matrix[provider.id] = providerModels.reduce((acc, model) => unionCapabilities(acc, model.capabilities), NO_CAPABILITIES)
  }

  return matrix
}
