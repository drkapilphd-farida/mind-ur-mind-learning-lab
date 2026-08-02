import type { PromptCompositionInput, PromptPackage } from '../types'
import type { PromptCompositionEngine } from '../contracts'
import { formatConversationContextSection, formatJourneyContextSection, formatMindContextSection, formatUserContextSection } from './formatContextSections'

// Implements PromptCompositionEngine. `systemPrompt` is built from
// exactly two ingredients, in order — the persona's own
// systemPromptFragment, then every safety rule as a bulleted list — so
// no mentor reply this layer's system prompt ever steers can omit the
// safety framing. `sections` holds the 4 context summaries separately
// (User, Journey, Mind, Conversation) rather than flattening them into
// `systemPrompt` itself, so a caller can choose how to present them.
export class DefaultPromptCompositionEngine implements PromptCompositionEngine {
  compose(input: PromptCompositionInput): PromptPackage {
    const safetyGuidance = input.safetyRules.map((rule) => `- ${rule.description}`).join('\n')

    const systemPrompt = [input.persona.systemPromptFragment, '', 'Safety rules (always follow):', safetyGuidance].join('\n')

    return {
      systemPrompt,
      sections: [
        formatUserContextSection(input.userContext),
        formatJourneyContextSection(input.journeyContext),
        formatMindContextSection(input.mindContext),
        formatConversationContextSection(input.conversationContext),
      ],
      persona: input.persona,
    }
  }
}

export function createPromptCompositionEngine(): PromptCompositionEngine {
  return new DefaultPromptCompositionEngine()
}
