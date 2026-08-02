import { describe, expect, it } from 'vitest'
import { createProviderSelectionRegistry } from './DefaultProviderSelectionRegistry'
import { makeProviderCatalogEntry } from '../testFixtures'

describe('DefaultProviderSelectionRegistry', () => {
  it('Provider Registration: registers a new entry and reports valid: true', () => {
    const registry = createProviderSelectionRegistry()
    const entry = makeProviderCatalogEntry({ providerId: 'openai' })

    expect(registry.register(entry)).toEqual({ valid: true, issues: [] })
  })

  it('Provider Discovery: a registered entry is discoverable via get/has/list', () => {
    const registry = createProviderSelectionRegistry()
    const entry = makeProviderCatalogEntry({ providerId: 'gemini' })
    registry.register(entry)

    expect(registry.get('gemini')).toEqual(entry)
    expect(registry.has('gemini')).toBe(true)
    expect(registry.list()).toEqual([entry])
  })

  it('Invalid Provider: get/has return a miss for an unregistered or unknown provider id, never throw', () => {
    const registry = createProviderSelectionRegistry()

    expect(registry.get('unknown-provider')).toBeUndefined()
    expect(registry.has('unknown-provider')).toBe(false)
  })

  it('Duplicate Provider: rejects a second registration for the same provider id without overwriting the first', () => {
    const registry = createProviderSelectionRegistry()
    const first = makeProviderCatalogEntry({ providerId: 'openai', priority: 1 })
    const second = makeProviderCatalogEntry({ providerId: 'openai', priority: 99 })

    registry.register(first)
    const result = registry.register(second)

    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-provider')).toBe(true)
    expect(registry.get('openai')).toEqual(first)
  })

  it('Registry Consistency: list() length always matches the number of successful registrations', () => {
    const registry = createProviderSelectionRegistry()
    registry.register(makeProviderCatalogEntry({ providerId: 'openai' }))
    registry.register(makeProviderCatalogEntry({ providerId: 'anthropic' }))
    registry.register(makeProviderCatalogEntry({ providerId: 'openai' })) // rejected duplicate

    expect(registry.list()).toHaveLength(2)
    expect(new Set(registry.list().map((entry) => entry.providerId)).size).toBe(2)
  })
})
