import { BaseProviderAdapter, type ProviderAdapterDependencies } from '@/features/ai-provider/adapter'
import type { AIModel, MappedProviderRequest, ProviderMetadata, RawProviderResult } from '@/features/ai-provider/types'
import { estimateTokens } from '@/features/ai-provider/adapters'
import type { ClaudeMessagesClient } from '../clients'

// Same pattern as OpenAIProviderAdapter — see that file's own header
// comment for why `execute()` only ever receives a flat prompt string
// and sends it as a single user-role message (no separate `system`
// field is populated, since MappedProviderRequest carries no such
// distinction to draw from).
export class ClaudeProviderAdapter extends BaseProviderAdapter {
  constructor(
    metadata: ProviderMetadata,
    models: readonly AIModel[],
    dependencies: ProviderAdapterDependencies,
    private readonly client: ClaudeMessagesClient,
  ) {
    super(metadata, models, dependencies)
  }

  protected async execute(mappedRequest: MappedProviderRequest): Promise<RawProviderResult> {
    const result = await this.client.createMessage({
      model: mappedRequest.modelId,
      messages: [{ role: 'user', content: mappedRequest.prompt }],
      maxTokens: mappedRequest.maxOutputTokens,
    })

    return {
      text: result.content,
      promptTokens: result.inputTokens ?? estimateTokens(mappedRequest.prompt),
      completionTokens: result.outputTokens ?? estimateTokens(result.content),
    }
  }
}
