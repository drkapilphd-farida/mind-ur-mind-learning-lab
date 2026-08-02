import type { AnthropicRawResponse } from './AnthropicRawResponse'
import type { GeminiRawResponse } from './GeminiRawResponse'
import type { OpenAIRawResponse } from './OpenAIRawResponse'

// Discriminated union — `normalizeProviderResponse.ts` switches on
// `providerId` to know which raw shape it's holding, same "dispatcher
// keyed by a closed provider id union" pattern as
// `provider-translation-engine/translation/translateMentorPromptPayload.ts`.
export type RawProviderResponse =
  | { readonly providerId: 'openai'; readonly response: OpenAIRawResponse }
  | { readonly providerId: 'anthropic'; readonly response: AnthropicRawResponse }
  | { readonly providerId: 'gemini'; readonly response: GeminiRawResponse }
