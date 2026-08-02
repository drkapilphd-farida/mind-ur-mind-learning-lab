// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file. `makeFakeOpenAIChatClient`/`makeFakeClaudeMessagesClient`
// are what every adapter test injects instead of the real SDK client —
// no test in this feature ever constructs `RealOpenAIChatClient`/
// `RealClaudeMessagesClient` or touches the network.
import type { ClaudeMessagesClient, ClaudeMessageRequest, ClaudeMessageResult, OpenAIChatClient, OpenAIChatCompletionRequest, OpenAIChatCompletionResult } from './clients'

export function makeFakeOpenAIChatClient(
  handler: (request: OpenAIChatCompletionRequest) => OpenAIChatCompletionResult | Promise<OpenAIChatCompletionResult> = (request) => ({
    content: `stub reply to: ${request.messages[request.messages.length - 1]?.content ?? ''}`,
    promptTokens: 10,
    completionTokens: 5,
  }),
): OpenAIChatClient {
  return { createChatCompletion: (request) => Promise.resolve(handler(request)) }
}

export function makeFakeClaudeMessagesClient(
  handler: (request: ClaudeMessageRequest) => ClaudeMessageResult | Promise<ClaudeMessageResult> = (request) => ({
    content: `stub reply to: ${request.messages[request.messages.length - 1]?.content ?? ''}`,
    inputTokens: 10,
    outputTokens: 5,
  }),
): ClaudeMessagesClient {
  return { createMessage: (request) => Promise.resolve(handler(request)) }
}
