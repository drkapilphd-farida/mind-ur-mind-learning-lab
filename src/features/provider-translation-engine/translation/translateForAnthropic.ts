import type { ProviderContext, ProviderMessage, ProviderRequest } from '../types'
import type { TranslationInputs } from './TranslationInputs'

// Pure — Anthropic profile: the real Anthropic Messages API doesn't
// accept a `system`-role message inside the message array (system
// prompt is supplied separately) — so `system-context`'s values are
// folded into `context.facts` instead of becoming a message. The other
// 5 sections become `user`-role messages. 5 messages total —
// `../validation/validateProviderRequest.ts` accounts for this
// deterministically via its Anthropic-specific coverage bonus.
export function translateForAnthropic(inputs: TranslationInputs, now: string, id: string): ProviderRequest {
  const messages: ProviderMessage[] = [
    { role: 'user', content: inputs.learnerContextValues.join(', ') },
    { role: 'user', content: inputs.currentJourneyValues.join(', ') },
    { role: 'user', content: inputs.recommendationValues.join(', ') },
    { role: 'user', content: inputs.nextActionValues.join(', ') },
    { role: 'user', content: inputs.metadataValues.join(', ') },
  ]

  const context: ProviderContext = {
    learnerId: inputs.learnerId,
    profileId: inputs.profileId,
    facts: [...inputs.systemContextValues, ...inputs.learnerContextValues, ...inputs.currentJourneyValues],
  }

  return {
    id,
    version: 1,
    providerId: 'anthropic',
    context,
    messages,
    instructions: inputs.instructions,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'provider-translation-engine', generatedAt: now },
  }
}
