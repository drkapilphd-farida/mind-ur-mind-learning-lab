// A minimal port — the only shape OpenAIProviderAdapter actually
// depends on, not the full `openai` SDK client. Keeps the adapter
// testable without ever touching the real package (tests inject a
// fake satisfying this interface) and keeps the coupling to the SDK's
// exact surface confined to createRealOpenAIChatClient.ts alone.
export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type OpenAIChatCompletionRequest = {
  model: string
  messages: readonly OpenAIChatMessage[]
  maxTokens: number
}

export type OpenAIChatCompletionResult = {
  content: string
  promptTokens: number | null
  completionTokens: number | null
}

export interface OpenAIChatClient {
  createChatCompletion(request: OpenAIChatCompletionRequest): Promise<OpenAIChatCompletionResult>
}
