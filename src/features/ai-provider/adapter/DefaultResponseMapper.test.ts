import { describe, expect, it } from 'vitest'
import { createResponseMapper } from './DefaultResponseMapper'

describe('DefaultResponseMapper', () => {
  const mapper = createResponseMapper()

  it('maps a RawProviderResult + context into a complete AIResponse', () => {
    const response = mapper.mapResponse(
      { text: 'Hello back', promptTokens: 3, completionTokens: 5 },
      { id: 'response-1', providerId: 'acme', modelId: 'acme-chat' },
    )

    expect(response).toEqual({
      id: 'response-1',
      providerId: 'acme',
      modelId: 'acme-chat',
      content: 'Hello back',
      usage: { inputTokens: 3, outputTokens: 5, totalTokens: 8 },
      finishReason: 'stop',
    })
  })
})
