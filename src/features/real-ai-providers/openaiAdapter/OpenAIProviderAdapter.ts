import { BaseProviderAdapter, type ProviderAdapterDependencies } from '@/features/ai-provider/adapter'
import type { AIModel, MappedProviderRequest, ProviderMetadata, RawProviderResult } from '@/features/ai-provider/types'
import { estimateTokens } from '@/features/ai-provider/adapters'
import type { OpenAIChatClient } from '../clients'

// Extends ai-provider's BaseProviderAdapter (Sprint 5, Chunk 3,
// unmodified) exactly the way its own header comment anticipated:
// "A subclass implements exactly one method — execute()." Everything
// else — lifecycle gating, model selection, capability validation,
// request/response mapping, error translation — is inherited unchanged.
//
// `execute()` only ever receives a flat `prompt: string`
// (MappedProviderRequest's shape, frozen by Sprint 5) — there is no
// structured messages array available at this layer, since
// DefaultRequestMapper flattens AIRequest.messages into one
// "role: content" per line string. This adapter sends that flattened
// prompt as a single user-role message to the real Chat Completions
// API — a known, documented consequence of not modifying Sprint 5's
// MappedProviderRequest type, not a bug.
export class OpenAIProviderAdapter extends BaseProviderAdapter {
  constructor(
    metadata: ProviderMetadata,
    models: readonly AIModel[],
    dependencies: ProviderAdapterDependencies,
    private readonly client: OpenAIChatClient,
  ) {
    super(metadata, models, dependencies)
  }

  protected async execute(mappedRequest: MappedProviderRequest): Promise<RawProviderResult> {
    const result = await this.client.createChatCompletion({
      model: mappedRequest.modelId,
      messages: [{ role: 'user', content: mappedRequest.prompt }],
      maxTokens: mappedRequest.maxOutputTokens,
    })

    return {
      text: result.content,
      promptTokens: result.promptTokens ?? estimateTokens(mappedRequest.prompt),
      completionTokens: result.completionTokens ?? estimateTokens(result.content),
    }
  }
}
