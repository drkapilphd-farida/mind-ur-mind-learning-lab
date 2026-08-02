// 'system' | 'user' | 'assistant' — the industry-standard wire-level
// role vocabulary every real provider (OpenAI, Claude, Gemini, ...)
// uses, appropriate here because AIRequest *is* the provider boundary
// itself. Distinct from `@/features/ai-mentor`'s own
// 'system'/'mentor'/'learner' PromptBuilder vocabulary, which
// deliberately stays abstract one layer up — translating between the
// two is a future integration concern, not this sprint's (Provider
// Layer knows nothing about Mentors or Conversations, per "Provider
// Layer must be the ONLY component that knows about AI providers").
export type AIRequestRole = 'system' | 'user' | 'assistant'

export type AIRequestMessage = {
  role: AIRequestRole
  content: string
}

export type AIRequest = {
  id: string
  modelId: string
  messages: readonly AIRequestMessage[]
  temperature?: number
  maxOutputTokens?: number
}
