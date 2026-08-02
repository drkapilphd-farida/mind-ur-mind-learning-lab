import type { ProviderContext, ProviderMessage, ProviderRequest } from '../types'
import type { TranslationInputs } from './TranslationInputs'

// Pure — OpenAI profile: real, well-known OpenAI Chat Completions
// convention supports a `system`-role message directly, so
// `system-context` becomes one. The other 5 sections become
// `user`-role messages. 6 messages total. "Only schema translation" —
// every `content` is a deterministic join of already-structured
// values, never generated prose.
export function translateForOpenAI(inputs: TranslationInputs, now: string, id: string): ProviderRequest {
  const messages: ProviderMessage[] = [
    { role: 'system', content: inputs.systemContextValues.join(', ') },
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
    providerId: 'openai',
    context,
    messages,
    instructions: inputs.instructions,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'provider-translation-engine', generatedAt: now },
  }
}
