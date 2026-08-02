import type { ProviderContext, ProviderMessage, ProviderRequest } from '../types'
import type { TranslationInputs } from './TranslationInputs'

// Pure — Gemini profile: early Gemini API generations don't support a
// `system` role at all, so `system-context` becomes a `user`-role
// message instead (unlike the OpenAI profile). The other 5 sections
// also become `user`-role messages. 6 messages total, no `system`
// role anywhere.
export function translateForGemini(inputs: TranslationInputs, now: string, id: string): ProviderRequest {
  const messages: ProviderMessage[] = [
    { role: 'user', content: inputs.systemContextValues.join(', ') },
    { role: 'user', content: inputs.learnerContextValues.join(', ') },
    { role: 'user', content: inputs.currentJourneyValues.join(', ') },
    { role: 'user', content: inputs.recommendationValues.join(', ') },
    { role: 'user', content: inputs.nextActionValues.join(', ') },
    { role: 'user', content: inputs.metadataValues.join(', ') },
  ]

  const context: ProviderContext = {
    learnerId: inputs.learnerId,
    profileId: inputs.profileId,
    facts: [...inputs.learnerContextValues, ...inputs.currentJourneyValues],
  }

  return {
    id,
    version: 1,
    providerId: 'gemini',
    context,
    messages,
    instructions: inputs.instructions,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'provider-translation-engine', generatedAt: now },
  }
}
