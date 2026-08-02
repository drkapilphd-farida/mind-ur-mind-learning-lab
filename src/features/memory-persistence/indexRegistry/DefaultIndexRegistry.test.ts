import { describe, expect, it } from 'vitest'
import { createIndexRegistry } from './DefaultIndexRegistry'
import { makeMemoryIndex } from '../testFixtures'

describe('DefaultIndexRegistry', () => {
  it('retrieveIndex() returns null for an unregistered index type', () => {
    const registry = createIndexRegistry()
    expect(registry.retrieveIndex('type')).toBeNull()
  })

  it('registerIndex() then retrieveIndex() returns the same index', () => {
    const registry = createIndexRegistry()
    const index = makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'a', updatedAt: 'a' } })
    registry.registerIndex(index)
    expect(registry.retrieveIndex('type')).toEqual(index)
  })

  it('registerIndex() with the same indexType replaces the previous registration', () => {
    const registry = createIndexRegistry()
    registry.registerIndex(makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'a', updatedAt: 'a' } }))
    registry.registerIndex(makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'a', updatedAt: 'b' } }))
    expect(registry.retrieveIndex('type')?.metadata.updatedAt).toBe('b')
  })

  it('removeIndex() deletes a registered index', () => {
    const registry = createIndexRegistry()
    registry.registerIndex(makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'a', updatedAt: 'a' } }))
    registry.removeIndex('type')
    expect(registry.retrieveIndex('type')).toBeNull()
  })

  it('removeIndex() is a no-op for an unregistered index type', () => {
    const registry = createIndexRegistry()
    expect(() => registry.removeIndex('type')).not.toThrow()
  })

  it('listRegisteredIndexes() returns an empty array when nothing is registered', () => {
    const registry = createIndexRegistry()
    expect(registry.listRegisteredIndexes()).toEqual([])
  })

  it('listRegisteredIndexes() returns every registered index', () => {
    const registry = createIndexRegistry()
    registry.registerIndex(makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'a', updatedAt: 'a' } }))
    registry.registerIndex(makeMemoryIndex({ metadata: { indexType: 'importance', createdAt: 'a', updatedAt: 'a' } }))
    expect(registry.listRegisteredIndexes().map((i) => i.metadata.indexType).sort()).toEqual(['importance', 'type'])
  })
})
