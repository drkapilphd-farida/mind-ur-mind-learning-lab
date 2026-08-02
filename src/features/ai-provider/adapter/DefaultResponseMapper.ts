import type { AIResponse, RawProviderResult, ResponseMapperContext } from '../types'
import type { ResponseMapper } from '../contracts'

// Implements ResponseMapper — the reverse of DefaultRequestMapper.
// `finishReason` is always 'stop' here since the mock never truncates
// output; a real ResponseMapper would read a real finish reason off
// its SDK's response instead.
export class DefaultResponseMapper implements ResponseMapper {
  mapResponse(raw: RawProviderResult, context: ResponseMapperContext): AIResponse {
    return {
      id: context.id,
      providerId: context.providerId,
      modelId: context.modelId,
      content: raw.text,
      usage: { inputTokens: raw.promptTokens, outputTokens: raw.completionTokens, totalTokens: raw.promptTokens + raw.completionTokens },
      finishReason: 'stop',
    }
  }
}

export function createResponseMapper(): ResponseMapper {
  return new DefaultResponseMapper()
}
