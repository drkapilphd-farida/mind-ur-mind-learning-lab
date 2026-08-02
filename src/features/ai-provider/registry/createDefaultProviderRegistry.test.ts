import { describe, expect, it } from 'vitest'
import { createDefaultProviderRegistry } from './createDefaultProviderRegistry'
import { createProviderRegistry } from './InMemoryProviderRegistry'
import { ALL_PROVIDERS } from '../providers'

describe('createDefaultProviderRegistry', () => {
  it('pre-registers every provider from ALL_PROVIDERS', () => {
    const registry = createDefaultProviderRegistry()
    expect(registry.list()).toHaveLength(ALL_PROVIDERS.length)
    for (const provider of ALL_PROVIDERS) {
      expect(registry.get(provider.metadata.id)).toBe(provider)
    }
  })

  it('createProviderRegistry (the plain factory) stays empty by default', () => {
    expect(createProviderRegistry().list()).toHaveLength(0)
  })
})
