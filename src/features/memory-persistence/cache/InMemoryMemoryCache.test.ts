import { describe, expect, it } from 'vitest'
import { createMemoryCache } from './InMemoryMemoryCache'
import { makeMemory } from '../testFixtures'

describe('InMemoryMemoryCache', () => {
  it('get() returns null for a key never set', () => {
    expect(createMemoryCache().get('missing')).toBeNull()
  })

  it('set() then get() returns the cached memory', () => {
    const cache = createMemoryCache()
    const memory = makeMemory()
    cache.set(memory)
    expect(cache.get(memory.id)).toBe(memory)
  })

  it('set() overwrites an existing entry with the same id', () => {
    const cache = createMemoryCache()
    cache.set(makeMemory({ content: 'first' }))
    cache.set(makeMemory({ content: 'second' }))
    expect(cache.get('memory-1')?.content).toBe('second')
  })

  it('remove() deletes a single entry', () => {
    const cache = createMemoryCache()
    cache.set(makeMemory({ id: 'a' }))
    cache.set(makeMemory({ id: 'b' }))
    cache.remove('a')
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).not.toBeNull()
  })

  it('clear() removes every entry', () => {
    const cache = createMemoryCache()
    cache.set(makeMemory({ id: 'a' }))
    cache.set(makeMemory({ id: 'b' }))
    cache.clear()
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBeNull()
  })
})
