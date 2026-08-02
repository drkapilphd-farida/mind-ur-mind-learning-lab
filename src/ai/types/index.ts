// AI subsystem-internal contracts — distinct from src/types/ai/ (the
// ai_events database row shape). These are the shapes router/providers/
// prompts/cache pass between each other, not persisted directly.
// See docs/adr/0002-domain-layered-architecture.md.

// Provider identifiers this subsystem knows how to route to. Additive —
// a new provider is a new union member plus a new file under providers/,
// never a change to the router's own logic.
export type AIProviderId = 'anthropic'

export type AIRequestPurpose = 'chat' | 'generation' | 'analysis'

export type AIRequest = {
  purpose: AIRequestPurpose
  // Which prompt template (see prompts/) this request is built from.
  promptKey: string
  // Template variables — shape is per promptKey, validated by the
  // template itself once real prompts exist.
  variables: Record<string, unknown>
  userId: string
  learningSessionId?: string
}

export type AIResponse = {
  provider: AIProviderId
  model: string
  content: string
  inputTokens: number
  outputTokens: number
}

export type AIProvider = {
  id: AIProviderId
  generate: (request: AIRequest) => Promise<AIResponse>
}

export type PromptTemplate = {
  key: string
  purpose: AIRequestPurpose
  // Renders `variables` into the final prompt string sent to a provider.
  render: (variables: Record<string, unknown>) => string
}
