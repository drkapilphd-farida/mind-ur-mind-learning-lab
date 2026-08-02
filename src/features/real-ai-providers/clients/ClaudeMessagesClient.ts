// The same minimal-port pattern as OpenAIChatClient, for Claude's
// Messages API shape (a separate `system` string rather than a
// system-role message in the array).
export type ClaudeMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ClaudeMessageRequest = {
  model: string
  system?: string
  maxTokens: number
  messages: readonly ClaudeMessage[]
}

export type ClaudeMessageResult = {
  content: string
  inputTokens: number | null
  outputTokens: number | null
}

export interface ClaudeMessagesClient {
  createMessage(request: ClaudeMessageRequest): Promise<ClaudeMessageResult>
}
