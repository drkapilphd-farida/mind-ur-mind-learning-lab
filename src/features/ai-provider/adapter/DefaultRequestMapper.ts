import type { AIModel, AIRequest, MappedProviderRequest } from '../types'
import type { RequestMapper } from '../contracts'

// Implements RequestMapper. Flattens AIRequest.messages into one
// "role: content" per-line prompt string — the mock's own
// deterministic wire shape. A real RequestMapper (OpenAI, Claude, ...)
// would instead build that provider's actual message-array/tool-call
// payload; nothing else in BaseProviderAdapter needs to change when
// that happens.
export class DefaultRequestMapper implements RequestMapper {
  mapRequest(request: AIRequest, model: AIModel): MappedProviderRequest {
    const prompt = request.messages.map((message) => `${message.role}: ${message.content}`).join('\n')
    return {
      modelId: model.id,
      prompt,
      maxOutputTokens: request.maxOutputTokens ?? model.maxOutputTokens,
    }
  }
}

export function createRequestMapper(): RequestMapper {
  return new DefaultRequestMapper()
}
