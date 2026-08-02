import OpenAI from 'openai'
import type { OpenAIChatClient, OpenAIChatCompletionRequest, OpenAIChatCompletionResult } from './OpenAIChatClient'

// The one file in this whole feature that imports the real `openai`
// package. `OPENAI_API_KEY` is read from `process.env` only — never
// hardcoded, never logged, never returned from any method here. The
// real `OpenAI` client is constructed lazily, on the first actual call,
// not at module load or object-construction time — so simply creating
// this client (e.g. as a default dependency wired into an adapter that
// never gets initialize()'d) can never throw for a missing key.
// "Application must continue working perfectly without any keys."
export class RealOpenAIChatClient implements OpenAIChatClient {
  private client: OpenAI | null = null

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }
    return this.client
  }

  async createChatCompletion(request: OpenAIChatCompletionRequest): Promise<OpenAIChatCompletionResult> {
    const response = await this.getClient().chat.completions.create({
      model: request.model,
      max_tokens: request.maxTokens,
      messages: request.messages.map((message) => ({ role: message.role, content: message.content })),
    })

    const content = response.choices[0]?.message.content ?? ''

    return {
      content,
      promptTokens: response.usage?.prompt_tokens ?? null,
      completionTokens: response.usage?.completion_tokens ?? null,
    }
  }
}

export function createRealOpenAIChatClient(): OpenAIChatClient {
  return new RealOpenAIChatClient()
}
