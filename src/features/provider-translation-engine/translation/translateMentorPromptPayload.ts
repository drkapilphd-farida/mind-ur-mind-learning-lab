import type { ProviderProfileId, ProviderRequest } from '../types'
import { translateForAnthropic } from './translateForAnthropic'
import { translateForGemini } from './translateForGemini'
import { translateForOpenAI } from './translateForOpenAI'
import type { TranslationInputs } from './TranslationInputs'

// Pure — "Translate ... into provider-neutral request contracts."
// Dispatches to the requested profile's own deterministic translator.
export function translateMentorPromptPayload(inputs: TranslationInputs, providerId: ProviderProfileId, now: string, id: string): ProviderRequest {
  switch (providerId) {
    case 'openai':
      return translateForOpenAI(inputs, now, id)
    case 'anthropic':
      return translateForAnthropic(inputs, now, id)
    case 'gemini':
      return translateForGemini(inputs, now, id)
  }
}
