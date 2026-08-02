import { describe, expect, it } from 'vitest'
import { MODEL_REGISTRY, SUPPORTED_PROVIDERS } from './index'

describe('SUPPORTED_PROVIDERS', () => {
  it('has exactly the 7 Sprint 6 supported providers', () => {
    expect(SUPPORTED_PROVIDERS.map((provider) => provider.id).sort()).toEqual(
      ['azure-openai', 'claude', 'custom', 'gemini', 'ollama', 'openai', 'openrouter'].sort(),
    )
  })

  it('every provider defaults to disabled', () => {
    for (const provider of SUPPORTED_PROVIDERS) {
      expect(provider.enabled).toBe(false)
    }
  })

  it('only Ollama does not require an API key', () => {
    for (const provider of SUPPORTED_PROVIDERS) {
      expect(provider.requiresApiKey).toBe(provider.id !== 'ollama')
    }
  })
})

describe('MODEL_REGISTRY', () => {
  it('every entry references a real supported provider id', () => {
    const supportedIds = new Set(SUPPORTED_PROVIDERS.map((provider) => provider.id))
    for (const model of MODEL_REGISTRY) {
      expect(supportedIds.has(model.providerId)).toBe(true)
    }
  })

  it('has at least one model per supported provider', () => {
    for (const provider of SUPPORTED_PROVIDERS) {
      expect(MODEL_REGISTRY.some((model) => model.providerId === provider.id)).toBe(true)
    }
  })

  it('has unique model ids', () => {
    const ids = MODEL_REGISTRY.map((model) => model.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
