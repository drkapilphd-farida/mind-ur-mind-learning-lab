import type { MentorContext } from '../types'
import type { MentorPrompt, MentorProviderReply, ProviderAdapter } from '../contracts'

// Implements ProviderAdapter — the deterministic stand-in for "the
// Mentor Response Pipeline"'s reply-generation step. No API call, no
// networking, no streaming: the reply is composed entirely from real
// MentorContext data (the top recommendation, if any) so the whole
// pipeline is testable end-to-end today. A future real ProviderAdapter
// (OpenAI/Claude/Gemini) implements this exact interface and actually
// calls a model; nothing upstream (ConversationOrchestrator,
// PromptBuilder, ContextBuilder) needs to change when that happens.
export class MockProviderAdapter implements ProviderAdapter {
  async generateReply(_prompt: MentorPrompt, context: MentorContext): Promise<MentorProviderReply> {
    const topRecommendation = context.recommendations[0]

    const content = topRecommendation
      ? `Thanks for sharing that. Based on where you are, I'd suggest: ${topRecommendation.title} — ${topRecommendation.description}`
      : "Thanks for sharing that. Let's keep building on what you've learned so far."

    return { content }
  }
}

export function createProviderAdapter(): ProviderAdapter {
  return new MockProviderAdapter()
}
