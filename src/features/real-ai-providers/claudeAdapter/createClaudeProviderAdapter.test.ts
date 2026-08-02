import { describe, expect, it } from 'vitest'
import { createClaudeProviderAdapter } from './createClaudeProviderAdapter'
import { ProviderAdapterError } from '@/features/ai-provider/adapter'
import { makeFakeClaudeMessagesClient } from '../testFixtures'
import { createEnvGatedProviderLifecycle } from '../lifecycle'
import type { AIRequest } from '@/features/ai-provider/types'

const makeAIRequest = (overrides: Partial<{ modelId: string; content: string }> = {}): AIRequest => ({
  id: 'req-1',
  modelId: overrides.modelId ?? 'claude-sonnet-5',
  messages: [{ role: 'user' as const, content: overrides.content ?? 'Hello' }],
})

async function withEnvVar<T>(name: string, value: string, run: () => Promise<T>): Promise<T> {
  process.env[name] = value
  try {
    return await run()
  } finally {
    delete process.env[name]
  }
}

describe('createClaudeProviderAdapter', () => {
  it('never touches the real network — every test injects a fake client', async () => {
    const client = makeFakeClaudeMessagesClient(() => ({ content: 'Hi there!', inputTokens: 3, outputTokens: 4 }))
    const adapter = createClaudeProviderAdapter({ client, dependencies: { lifecycle: createEnvGatedProviderLifecycle('claude', 'TEST_UNSET_VAR_ABC') } })

    await expect(adapter.generate(makeAIRequest())).rejects.toBeInstanceOf(ProviderAdapterError)
  })

  it('generates a response end-to-end through the injected fake client once initialized', async () => {
    const client = makeFakeClaudeMessagesClient(() => ({ content: 'Hi there!', inputTokens: 3, outputTokens: 4 }))
    const adapter = createClaudeProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('claude', 'TEST_CLAUDE_KEY_PRESENT') },
    })

    const response = await withEnvVar('TEST_CLAUDE_KEY_PRESENT', 'yes', async () => {
      await adapter.initialize()
      return adapter.generate(makeAIRequest({ content: 'How do I remember more?' }))
    })

    expect(response.content).toBe('Hi there!')
    expect(response.usage).toEqual({ inputTokens: 3, outputTokens: 4, totalTokens: 7 })
  })

  it('sends the flattened MappedProviderRequest prompt as a single user message to the client', async () => {
    let captured: readonly { role: string; content: string }[] = []
    const client = makeFakeClaudeMessagesClient((request) => {
      captured = request.messages
      return { content: 'ok', inputTokens: 1, outputTokens: 1 }
    })

    const adapter = createClaudeProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('claude', 'TEST_CLAUDE_KEY_PRESENT_2') },
    })

    await withEnvVar('TEST_CLAUDE_KEY_PRESENT_2', 'yes', async () => {
      await adapter.initialize()
      await adapter.generate(makeAIRequest({ content: 'test message' }))
    })

    expect(captured).toEqual([{ role: 'user', content: 'user: test message' }])
  })

  it('translates a client error into a ProviderAdapterError with a normalized AIError code', async () => {
    const rateLimitError = new Error('slow down')
    rateLimitError.name = 'RateLimitError'
    const client = makeFakeClaudeMessagesClient(() => {
      throw rateLimitError
    })

    const adapter = createClaudeProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('claude', 'TEST_CLAUDE_KEY_PRESENT_3') },
    })

    await withEnvVar('TEST_CLAUDE_KEY_PRESENT_3', 'yes', async () => {
      await adapter.initialize()
      await expect(adapter.generate(makeAIRequest())).rejects.toMatchObject({ aiError: { code: 'rate-limited', retryable: true } })
    })
  })
})
