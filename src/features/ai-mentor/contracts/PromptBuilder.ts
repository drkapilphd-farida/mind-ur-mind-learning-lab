import type { MentorContext } from '../types'

// A structured message list, not a flat string — every real provider
// (OpenAI/Claude/Gemini) takes role-tagged messages, so this shape
// stays provider-agnostic rather than baking in one provider's prompt
// format. Implemented by a plain composition function in Chunk 3.
export type MentorPromptRole = 'system' | 'mentor' | 'learner'

export type MentorPromptMessage = {
  role: MentorPromptRole
  content: string
}

export type MentorPrompt = {
  messages: readonly MentorPromptMessage[]
}

export interface PromptBuilder {
  build(context: MentorContext): MentorPrompt
}
