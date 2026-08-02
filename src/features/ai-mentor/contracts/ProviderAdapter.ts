import type { MentorContext } from '../types'
import type { MentorPrompt } from './PromptBuilder'

// The seam a real LLM provider (OpenAI/Claude/Gemini) implements
// later — explicitly not implemented this sprint, per "No OpenAI. No
// Claude. No Gemini. Provider-independent architecture only." Mirrors
// the "interfaces only, no SDK calls yet" stance `src/ai/providers/`
// already established in Sprint 0 for the platform's own general AI
// subsystem. Deliberately its own, narrower interface rather than
// reusing `src/ai/types`'s `AIProvider` — that one is a generic
// prompt-template-key request/response shape shared across the whole
// platform; ProviderAdapter is mentor-conversation-specific
// (MentorPrompt + MentorContext in, a mentor reply out). A future
// concrete ProviderAdapter implementation may internally call into
// `src/ai/`'s machinery — that wiring decision belongs to whichever
// sprint actually integrates a provider, not this one.
export type MentorProviderReply = {
  content: string
}

export interface ProviderAdapter {
  generateReply(prompt: MentorPrompt, context: MentorContext): Promise<MentorProviderReply>
}
