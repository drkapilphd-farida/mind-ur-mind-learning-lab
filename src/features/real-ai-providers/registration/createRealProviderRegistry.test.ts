import { describe, expect, it } from 'vitest'
import { createRealProviderRegistry } from './createRealProviderRegistry'
import { createMockProviderAdapter } from '@/features/ai-provider/adapter'
import { CHAT_CAPABILITIES } from '@/features/ai-provider/providers'

describe('createRealProviderRegistry', () => {
  it('registers exactly 3 providers: mock, openai, claude', () => {
    const { registry } = createRealProviderRegistry()
    expect(registry.list().map((provider) => provider.metadata.id).sort()).toEqual(['claude', 'mock', 'openai'])
  })

  it('returns the same 3 adapters via the adapters list, for lifecycle management', () => {
    const { adapters } = createRealProviderRegistry()
    expect(adapters).toHaveLength(3)
    expect(adapters.map((adapter) => adapter.metadata.id).sort()).toEqual(['claude', 'mock', 'openai'])
  })

  it('the mock provider is never env-gated — it becomes healthy once initialized, with no env var required', async () => {
    const { adapters } = createRealProviderRegistry()
    const mock = adapters.find((adapter) => adapter.metadata.id === 'mock')
    expect(mock).toBeDefined()
    await mock?.initialize()
    expect((await mock?.checkHealth())?.state).toBe('healthy')
  })

  it('accepts an injected override for a single provider, leaving the others default', () => {
    const customMock = createMockProviderAdapter({
      metadata: { id: 'mock', displayName: 'Custom Mock', description: 'test', supportsFineTuning: false },
      models: [{ id: 'custom-mock-model', displayName: 'Custom', providerId: 'mock', capabilities: CHAT_CAPABILITIES, contextWindowTokens: 1000, maxOutputTokens: 100 }],
    })
    const { registry } = createRealProviderRegistry({ mockProvider: customMock })
    expect(registry.get('mock')).toBe(customMock)
    expect(registry.get('openai')).toBeDefined()
  })
})
