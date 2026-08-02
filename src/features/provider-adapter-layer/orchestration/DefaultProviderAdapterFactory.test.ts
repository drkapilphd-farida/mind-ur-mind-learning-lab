import { describe, expect, it } from 'vitest'
import { createProviderAdapterFactory } from './DefaultProviderAdapterFactory'
import { ProviderAdapterException } from './ProviderAdapterException'

describe('DefaultProviderAdapterFactory', () => {
  it('Factory Resolution: creates a matching adapter for each of the 6 supported provider ids', () => {
    const factory = createProviderAdapterFactory()

    for (const providerId of ['openai', 'anthropic', 'gemini', 'grok', 'deepseek', 'local-llm']) {
      const adapter = factory.create(providerId)
      expect(adapter.providerId).toBe(providerId)
      expect(adapter.metadata.providerId).toBe(providerId)
    }
  })

  it('Invalid Provider: throws ProviderAdapterException for an unrecognized provider name', () => {
    const factory = createProviderAdapterFactory()

    expect(() => factory.create('unknown-provider')).toThrow(ProviderAdapterException)
  })
})
