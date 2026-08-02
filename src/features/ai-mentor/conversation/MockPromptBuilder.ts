import type { MentorPrompt, MentorPromptMessage, PromptBuilder } from '../contracts'
import type { MentorContext } from '../types'

// Implements PromptBuilder — "Prompt Builder (deterministic only)."
// Produces a generic, role-tagged message list ('system' | 'mentor' |
// 'learner') — never a provider-specific format (no OpenAI 'assistant'/
// 'user' naming, no model-specific instruction syntax). A future real
// ProviderAdapter translates this generic shape into whatever format
// its provider needs; that translation is explicitly not this file's
// job.
export class MockPromptBuilder implements PromptBuilder {
  build(context: MentorContext): MentorPrompt {
    const systemLines = ['You are a supportive learning mentor.']

    if (context.recommendations.length > 0) {
      systemLines.push(`Relevant recommendations: ${context.recommendations.map((recommendation) => recommendation.title).join('; ')}.`)
    }

    if (context.memory.length > 0) {
      systemLines.push(`Known about this learner: ${context.memory.join('; ')}.`)
    }

    const messages: MentorPromptMessage[] = [
      { role: 'system', content: systemLines.join(' ') },
      ...context.recentMessages.map((message) => ({ role: message.role, content: message.content }) satisfies MentorPromptMessage),
    ]

    return { messages }
  }
}

export function createPromptBuilder(): PromptBuilder {
  return new MockPromptBuilder()
}
