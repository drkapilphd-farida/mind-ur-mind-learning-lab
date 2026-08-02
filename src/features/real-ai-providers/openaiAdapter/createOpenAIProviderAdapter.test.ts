import { describe, expect, it } from 'vitest'
import { createOpenAIProviderAdapter } from './createOpenAIProviderAdapter'
import { ProviderAdapterError } from '@/features/ai-provider/adapter'
import { makeFakeOpenAIChatClient } from '../testFixtures'
import { createEnvGatedProviderLifecycle } from '../lifecycle'
import type { AIRequest } from '@/features/ai-provider/types'

const makeAIRequest = (overrides: Partial<{ modelId: string; content: string }> = {}): AIRequest => ({
  id: 'req-1',
  modelId: overrides.modelId ?? 'gpt-4o-mini',
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

describe('createOpenAIProviderAdapter', () => {
  it('never touches the real network — every test injects a fake client', async () => {
    const client = makeFakeOpenAIChatClient(() => ({ content: 'Hi there!', promptTokens: 3, completionTokens: 4 }))
    const adapter = createOpenAIProviderAdapter({ client, dependencies: { lifecycle: createEnvGatedProviderLifecycle('openai', 'TEST_UNSET_VAR_XYZ') } })

    // No env var set for this adapter's lifecycle — generate() must
    // fail with a real ProviderAdapterError, not silently succeed.
    await expect(adapter.generate(makeAIRequest())).rejects.toBeInstanceOf(ProviderAdapterError)
  })

  it('generates a response end-to-end through the injected fake client once initialized', async () => {
    const client = makeFakeOpenAIChatClient(() => ({ content: 'Hi there!', promptTokens: 3, completionTokens: 4 }))
    const adapter = createOpenAIProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('openai', 'TEST_OPENAI_KEY_PRESENT') },
    })

    const response = await withEnvVar('TEST_OPENAI_KEY_PRESENT', 'yes', async () => {
      await adapter.initialize()
      return adapter.generate(makeAIRequest({ content: 'How do I read faster?' }))
    })

    expect(response.content).toBe('Hi there!')
    expect(response.usage).toEqual({ inputTokens: 3, outputTokens: 4, totalTokens: 7 })
  })

  it('sends the flattened MappedProviderRequest prompt as a single user message to the client', async () => {
    let capturedMessages: readonly { role: string; content: string }[] = []
    const client = makeFakeOpenAIChatClient((request) => {
      capturedMessages = request.messages
      return { content: 'ok', promptTokens: 1, completionTokens: 1 }
    })

    const adapter = createOpenAIProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('openai', 'TEST_OPENAI_KEY_PRESENT_2') },
    })

    await withEnvVar('TEST_OPENAI_KEY_PRESENT_2', 'yes', async () => {
      await adapter.initialize()
      await adapter.generate(makeAIRequest({ content: 'test message' }))
    })

    expect(capturedMessages).toEqual([{ role: 'user', content: 'user: test message' }])
  })

  it('translates a client error into a ProviderAdapterError with a normalized AIError code', async () => {
    const authError = new Error('invalid key')
    authError.name = 'AuthenticationError'
    const client = makeFakeOpenAIChatClient(() => {
      throw authError
    })

    const adapter = createOpenAIProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('openai', 'TEST_OPENAI_KEY_PRESENT_3') },
    })

    await withEnvVar('TEST_OPENAI_KEY_PRESENT_3', 'yes', async () => {
      await adapter.initialize()
      await expect(adapter.generate(makeAIRequest())).rejects.toMatchObject({ aiError: { code: 'authentication-failed' } })
    })
  })

  it('falls back to estimateTokens when the client reports no usage', async () => {
    const client = makeFakeOpenAIChatClient(() => ({ content: 'a reply', promptTokens: null, completionTokens: null }))
    const adapter = createOpenAIProviderAdapter({
      client,
      dependencies: { lifecycle: createEnvGatedProviderLifecycle('openai', 'TEST_OPENAI_KEY_PRESENT_4') },
    })

    const response = await withEnvVar('TEST_OPENAI_KEY_PRESENT_4', 'yes', async () => {
      await adapter.initialize()
      return adapter.generate(makeAIRequest())
    })

    expect(response.usage.inputTokens).toBeGreaterThan(0)
    expect(response.usage.outputTokens).toBeGreaterThan(0)
  })
})
