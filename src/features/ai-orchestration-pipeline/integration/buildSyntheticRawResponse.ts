import type { ProviderExecutionRequest } from '@/features/provider-request-pipeline'
import type { RawProviderResponse } from '@/features/provider-response-pipeline'

// Deterministic, provider-agnostic synthetic response — "Do NOT
// implement: OpenAI/Anthropic/Gemini API" rules out ever calling a
// real provider, so this echoes the execution request's own messages
// back as the response content, shaped per that provider's own raw
// schema (`provider-response-pipeline/translation/`'s own 3 raw
// shapes). No generation — pure structural echo, same "no network call
// anywhere in this arc" posture Sprint 33 already established.
export function buildSyntheticRawResponse(executionRequest: ProviderExecutionRequest): RawProviderResponse {
  const text = executionRequest.messages.map((message) => message.content).join(' | ')
  const promptTokens = executionRequest.messages.length * 10
  const completionTokens = 20

  switch (executionRequest.providerId) {
    case 'openai':
      return {
        providerId: 'openai',
        response: {
          choices: [{ message: { content: text }, finish_reason: 'stop' }],
          usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
        },
      }
    case 'anthropic':
      return {
        providerId: 'anthropic',
        response: {
          content: [{ text }],
          stop_reason: 'end_turn',
          usage: { input_tokens: promptTokens, output_tokens: completionTokens },
        },
      }
    case 'gemini':
      return {
        providerId: 'gemini',
        response: {
          candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: promptTokens, candidatesTokenCount: completionTokens },
        },
      }
  }
}
