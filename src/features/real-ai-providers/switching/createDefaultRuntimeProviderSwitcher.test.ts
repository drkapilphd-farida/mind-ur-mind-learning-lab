import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDefaultRuntimeProviderSwitcher } from './createDefaultRuntimeProviderSwitcher'

const ENV_KEYS = ['AI_ACTIVE_PROVIDER_ID', 'AI_PROVIDER_OPENAI_ENABLED', 'AI_PROVIDER_CLAUDE_ENABLED', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']
let originals: Record<string, string | undefined> = {}

beforeEach(() => {
  originals = {}
  for (const key of ENV_KEYS) {
    originals[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originals[key] === undefined) delete process.env[key]
    else process.env[key] = originals[key]
  }
})

// The single most important test in this sprint: with a clean
// environment (exactly what development and CI actually look like —
// nothing set), the fully-real default wiring must resolve to mock.
// "No real API requests should occur in development or tests" is true
// because of this, not because of a special test-only code path.
describe('createDefaultRuntimeProviderSwitcher — clean environment', () => {
  it('resolves to mock when no env vars are set at all', async () => {
    const switcher = createDefaultRuntimeProviderSwitcher()
    const { provider, resolution } = await switcher.getActiveProvider()
    expect(provider.metadata.id).toBe('mock')
    expect(resolution.isMock).toBe(true)
  })

  it('still resolves to mock even if AI_ACTIVE_PROVIDER_ID and the feature flag are set, but no API key is present', async () => {
    process.env.AI_ACTIVE_PROVIDER_ID = 'openai'
    process.env.AI_PROVIDER_OPENAI_ENABLED = 'true'
    // deliberately no OPENAI_API_KEY

    const switcher = createDefaultRuntimeProviderSwitcher()
    const { provider, resolution } = await switcher.getActiveProvider()
    expect(provider.metadata.id).toBe('mock')
    expect(resolution.reason).toContain('no credentials')
  })

  it('resolves to openai only when active id, feature flag, AND credentials all line up', async () => {
    process.env.AI_ACTIVE_PROVIDER_ID = 'openai'
    process.env.AI_PROVIDER_OPENAI_ENABLED = 'true'
    process.env.OPENAI_API_KEY = 'test-key-for-this-test-only'

    const switcher = createDefaultRuntimeProviderSwitcher()
    const { provider, resolution } = await switcher.getActiveProvider()
    expect(provider.metadata.id).toBe('openai')
    expect(resolution.isMock).toBe(false)
  })

  it('resolves to claude only when active id, feature flag, AND credentials all line up', async () => {
    process.env.AI_ACTIVE_PROVIDER_ID = 'claude'
    process.env.AI_PROVIDER_CLAUDE_ENABLED = 'true'
    process.env.ANTHROPIC_API_KEY = 'test-key-for-this-test-only'

    const switcher = createDefaultRuntimeProviderSwitcher()
    const { provider } = await switcher.getActiveProvider()
    expect(provider.metadata.id).toBe('claude')
  })
})
