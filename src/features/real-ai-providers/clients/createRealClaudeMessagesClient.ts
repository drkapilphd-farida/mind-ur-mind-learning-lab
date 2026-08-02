import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeMessagesClient, ClaudeMessageRequest, ClaudeMessageResult } from './ClaudeMessagesClient'

// The one file in this whole feature that imports the real
// `@anthropic-ai/sdk` package — same lazy-construction discipline as
// RealOpenAIChatClient. `ANTHROPIC_API_KEY` is read from `process.env`
// only.
export class RealClaudeMessagesClient implements ClaudeMessagesClient {
  private client: Anthropic | null = null

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    }
    return this.client
  }

  async createMessage(request: ClaudeMessageRequest): Promise<ClaudeMessageResult> {
    const response = await this.getClient().messages.create({
      model: request.model,
      max_tokens: request.maxTokens,
      ...(request.system !== undefined ? { system: request.system } : {}),
      messages: request.messages.map((message) => ({ role: message.role, content: message.content })),
    })

    const content = response.content
      .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
      .map((block) => block.text)
      .join('')

    return {
      content,
      inputTokens: response.usage.input_tokens ?? null,
      outputTokens: response.usage.output_tokens ?? null,
    }
  }
}

export function createRealClaudeMessagesClient(): ClaudeMessagesClient {
  return new RealClaudeMessagesClient()
}
