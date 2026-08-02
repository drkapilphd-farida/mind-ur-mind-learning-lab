import { describe, expect, it } from 'vitest'
import type { AIProvider } from '@/features/ai-provider/contracts'
import { RuntimeAIProviderFactory, createRuntimeAIProviderFactory } from './RuntimeAIProviderFactory'

function makeFakeProvider(id: string): AIProvider {
  return {
    metadata: { id, displayName: id, description: '', supportsFineTuning: false },
    models: [],
    generate: async () => {
      throw new Error('not implemented in this fake')
    },
    checkHealth: async () => ({ providerId: id, state: 'healthy', checkedAt: new Date().toISOString() }),
    estimateCost: () => ({ inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }),
  }
}

describe('RuntimeAIProviderFactory', () => {
  it('resolves whatever provider the injected switcher returns', async () => {
    const fakeProvider = makeFakeProvider('mock')
    const factory = new RuntimeAIProviderFactory({
      switcher: { getActiveProvider: async () => ({ provider: fakeProvider, resolution: { providerId: 'mock', isMock: true, reason: 'test' } }) },
    })

    expect(await factory.resolveProvider()).toBe(fakeProvider)
  })

  it('createRuntimeAIProviderFactory wires the same injected switcher', async () => {
    const fakeProvider = makeFakeProvider('claude')
    const factory = createRuntimeAIProviderFactory({
      switcher: { getActiveProvider: async () => ({ provider: fakeProvider, resolution: { providerId: 'claude', isMock: false, reason: 'test' } }) },
    })

    expect(await factory.resolveProvider()).toBe(fakeProvider)
  })

  it('with default (real) wiring and no AI_* env vars set, resolves to the always-available mock provider', async () => {
    const factory = new RuntimeAIProviderFactory()
    const provider = await factory.resolveProvider()
    expect(provider.metadata.id).toBe('mock')
  })
})
