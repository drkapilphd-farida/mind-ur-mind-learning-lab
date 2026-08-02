import type { ProviderExecutionResponse } from '../types'
import { normalizeAnthropicResponse } from './normalizeAnthropicResponse'
import { normalizeGeminiResponse } from './normalizeGeminiResponse'
import { normalizeOpenAIResponse } from './normalizeOpenAIResponse'
import type { RawProviderResponse } from './RawProviderResponse'
import type { ResponseNormalizationInputs } from './ResponseNormalizationInputs'

// Pure — "Convert provider-specific response schemas into a unified
// internal response model." Dispatches to the matching profile's own
// deterministic normalizer.
export function normalizeProviderResponse(raw: RawProviderResponse, correlation: ResponseNormalizationInputs, now: string, id: string): ProviderExecutionResponse {
  switch (raw.providerId) {
    case 'openai':
      return normalizeOpenAIResponse(raw.response, correlation, now, id)
    case 'anthropic':
      return normalizeAnthropicResponse(raw.response, correlation, now, id)
    case 'gemini':
      return normalizeGeminiResponse(raw.response, correlation, now, id)
  }
}
