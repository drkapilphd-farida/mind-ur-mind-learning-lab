import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createEnvProviderCredentialResolver } from './EnvProviderCredentialResolver'

const KEYS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY']
let originals: Record<string, string | undefined> = {}

beforeEach(() => {
  originals = {}
  for (const key of KEYS) {
    originals[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of KEYS) {
    if (originals[key] === undefined) delete process.env[key]
    else process.env[key] = originals[key]
  }
})

describe('EnvProviderCredentialResolver', () => {
  it('reports no credentials for openai/claude when neither env var is set', () => {
    const resolver = createEnvProviderCredentialResolver()
    expect(resolver.hasCredentials('openai')).toBe(false)
    expect(resolver.hasCredentials('claude')).toBe(false)
  })

  it('reports credentials present for openai when OPENAI_API_KEY is set', () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    expect(createEnvProviderCredentialResolver().hasCredentials('openai')).toBe(true)
  })

  it('reports credentials present for claude when ANTHROPIC_API_KEY is set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    expect(createEnvProviderCredentialResolver().hasCredentials('claude')).toBe(true)
  })

  it('reports false for every provider this sprint has no real adapter for, regardless of env state', () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    const resolver = createEnvProviderCredentialResolver()
    expect(resolver.hasCredentials('gemini')).toBe(false)
    expect(resolver.hasCredentials('azure-openai')).toBe(false)
    expect(resolver.hasCredentials('openrouter')).toBe(false)
    expect(resolver.hasCredentials('ollama')).toBe(false)
    expect(resolver.hasCredentials('custom')).toBe(false)
  })

  it('never returns the actual key value from any method', () => {
    process.env.OPENAI_API_KEY = 'sk-should-never-leak'
    const resolver = createEnvProviderCredentialResolver()
    const result = resolver.hasCredentials('openai')
    expect(typeof result).toBe('boolean')
  })
})
