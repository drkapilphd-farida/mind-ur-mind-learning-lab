import { describe, expect, it } from 'vitest'
import { DefaultProviderAdapter } from './DefaultProviderAdapter'
import { createProviderAdapterRegistry } from './DefaultProviderAdapterRegistry'
import { makeProviderAdapterMetadata } from '../testFixtures'

describe('DefaultProviderAdapterRegistry', () => {
  it('Adapter Registration: registers a new adapter and makes it discoverable', () => {
    const registry = createProviderAdapterRegistry()
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'openai' }))

    const result = registry.register(adapter)

    expect(result).toEqual({ valid: true, issues: [] })
    expect(registry.has('openai')).toBe(true)
    expect(registry.get('openai')).toBe(adapter)
    expect(registry.list()).toEqual([adapter])
  })

  it('Duplicate Registration: rejects a second registration for the same provider id without overwriting the first', () => {
    const registry = createProviderAdapterRegistry()
    const first = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'openai', providerVersion: '1.0.0' }))
    const second = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'openai', providerVersion: '2.0.0' }))

    registry.register(first)
    const result = registry.register(second)

    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'invalid-adapter-registration')).toBe(true)
    expect(registry.get('openai')).toBe(first)
    expect(registry.list()).toHaveLength(1)
  })
})
