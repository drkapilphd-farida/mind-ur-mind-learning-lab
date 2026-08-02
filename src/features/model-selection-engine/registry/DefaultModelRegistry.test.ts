import { describe, expect, it } from 'vitest'
import { createModelRegistry } from './DefaultModelRegistry'
import { makeModelCatalogEntry, makeModelMetadata } from '../testFixtures'

describe('DefaultModelRegistry', () => {
  it('Registration: registers a new entry and reports valid: true', () => {
    const registry = createModelRegistry()
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }) })

    expect(registry.register(entry)).toEqual({ valid: true, issues: [] })
  })

  it('Lookup: a registered entry is discoverable via get/has/list/listByProvider', () => {
    const registry = createModelRegistry()
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gemini-1.5-flash', providerId: 'gemini' }) })
    registry.register(entry)

    expect(registry.get('gemini-1.5-flash')).toEqual(entry)
    expect(registry.has('gemini-1.5-flash')).toBe(true)
    expect(registry.list()).toEqual([entry])
    expect(registry.listByProvider('gemini')).toEqual([entry])
    expect(registry.listByProvider('openai')).toEqual([])
  })

  it('Unknown Model: get/has return a miss for an unregistered model id, never throw', () => {
    const registry = createModelRegistry()

    expect(registry.get('unknown-model')).toBeUndefined()
    expect(registry.has('unknown-model')).toBe(false)
  })

  it('Duplicate Prevention: rejects a second registration for the same model id without overwriting the first', () => {
    const registry = createModelRegistry()
    const first = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }), priority: 1 })
    const second = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }), priority: 99 })

    registry.register(first)
    const result = registry.register(second)

    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-model')).toBe(true)
    expect(registry.get('gpt-4o')).toEqual(first)
  })

  it('Registry Integrity: list() length always matches the number of successful registrations', () => {
    const registry = createModelRegistry()
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }) }))
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini' }) }))
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }) })) // rejected duplicate

    expect(registry.list()).toHaveLength(2)
    expect(new Set(registry.list().map((entry) => entry.metadata.id)).size).toBe(2)
  })

  it('Empty Registry: list() and listByProvider() return empty arrays before any registration', () => {
    const registry = createModelRegistry()

    expect(registry.list()).toEqual([])
    expect(registry.listByProvider('openai')).toEqual([])
  })
})
