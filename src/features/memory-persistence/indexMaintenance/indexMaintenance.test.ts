import { describe, expect, it } from 'vitest'
import { buildMemoryIndex } from './buildMemoryIndex'
import { updateMemoryIndex } from './updateMemoryIndex'
import { removeMemoryFromIndex } from './removeMemoryFromIndex'
import { rebuildMemoryIndex } from './rebuildMemoryIndex'
import { makeMemory } from '../testFixtures'

describe('buildMemoryIndex', () => {
  it('builds an empty index from an empty memory list', () => {
    const index = buildMemoryIndex('type', [], '2026-01-01T00:00:00.000Z')
    expect(index).toEqual({
      metadata: { indexType: 'type', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      entries: [],
    })
  })

  it('groups memories sharing a key into one entry', () => {
    const memories = [makeMemory({ id: 'a', type: 'exercise' }), makeMemory({ id: 'b', type: 'exercise' })]
    const index = buildMemoryIndex('type', memories, '2026-01-01T00:00:00.000Z')
    expect(index.entries).toEqual([{ key: 'exercise', memoryIds: ['a', 'b'] }])
  })

  it('produces one entry per distinct key, sorted by key', () => {
    const memories = [makeMemory({ id: 'a', importance: 'low' }), makeMemory({ id: 'b', importance: 'critical' })]
    const index = buildMemoryIndex('importance', memories, '2026-01-01T00:00:00.000Z')
    expect(index.entries.map((e) => e.key)).toEqual(['critical', 'low'])
  })

  it('a tag index produces one entry per tag, a memory with multiple tags contributing to multiple entries', () => {
    const memories = [makeMemory({ id: 'a', metadata: { learnerId: 'l', source: 's', tags: ['x', 'y'] } })]
    const index = buildMemoryIndex('tag', memories, '2026-01-01T00:00:00.000Z')
    expect(index.entries).toEqual([
      { key: 'x', memoryIds: ['a'] },
      { key: 'y', memoryIds: ['a'] },
    ])
  })

  it('is deterministic regardless of input order', () => {
    const a = makeMemory({ id: 'a', importance: 'low' })
    const b = makeMemory({ id: 'b', importance: 'critical' })
    const forward = buildMemoryIndex('importance', [a, b], '2026-01-01T00:00:00.000Z')
    const backward = buildMemoryIndex('importance', [b, a], '2026-01-01T00:00:00.000Z')
    expect(forward.entries).toEqual(backward.entries)
  })
})

describe('updateMemoryIndex', () => {
  it('adds a new memory to an index it was not previously part of', () => {
    const index = buildMemoryIndex('type', [], '2026-01-01T00:00:00.000Z')
    const updated = updateMemoryIndex(index, makeMemory({ id: 'a', type: 'exercise' }), '2026-01-02T00:00:00.000Z')
    expect(updated.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
    expect(updated.metadata.updatedAt).toBe('2026-01-02T00:00:00.000Z')
  })

  it('moves a memory to its new key when the indexed field changed, removing the stale association', () => {
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    const index = buildMemoryIndex('type', [memory], '2026-01-01T00:00:00.000Z')

    const changed = { ...memory, type: 'milestone' as const }
    const updated = updateMemoryIndex(index, changed, '2026-01-02T00:00:00.000Z')

    expect(updated.entries).toEqual([{ key: 'milestone', memoryIds: ['a'] }])
  })

  it('leaves other memories under the same key untouched', () => {
    const a = makeMemory({ id: 'a', type: 'exercise' })
    const b = makeMemory({ id: 'b', type: 'exercise' })
    const index = buildMemoryIndex('type', [a, b], '2026-01-01T00:00:00.000Z')

    const updated = updateMemoryIndex(index, a, '2026-01-02T00:00:00.000Z')
    expect(updated.entries).toEqual([{ key: 'exercise', memoryIds: ['b', 'a'] }])
  })

  it('removes all associations when the memory now produces zero keys (e.g. all tags removed)', () => {
    const memory = makeMemory({ id: 'a', metadata: { learnerId: 'l', source: 's', tags: ['x'] } })
    const index = buildMemoryIndex('tag', [memory], '2026-01-01T00:00:00.000Z')

    const changed = { ...memory, metadata: { ...memory.metadata, tags: [] } }
    const updated = updateMemoryIndex(index, changed, '2026-01-02T00:00:00.000Z')
    expect(updated.entries).toEqual([])
  })
})

describe('removeMemoryFromIndex', () => {
  it('removes the given memory id from every entry', () => {
    const memories = [makeMemory({ id: 'a', type: 'exercise' }), makeMemory({ id: 'b', type: 'exercise' })]
    const index = buildMemoryIndex('type', memories, '2026-01-01T00:00:00.000Z')

    const updated = removeMemoryFromIndex(index, 'a', '2026-01-02T00:00:00.000Z')
    expect(updated.entries).toEqual([{ key: 'exercise', memoryIds: ['b'] }])
    expect(updated.metadata.updatedAt).toBe('2026-01-02T00:00:00.000Z')
  })

  it('drops an entry entirely once its last memory id is removed', () => {
    const index = buildMemoryIndex('type', [makeMemory({ id: 'a', type: 'exercise' })], '2026-01-01T00:00:00.000Z')
    const updated = removeMemoryFromIndex(index, 'a', '2026-01-02T00:00:00.000Z')
    expect(updated.entries).toEqual([])
  })

  it('is a no-op (aside from bumping updatedAt) for an id that was never indexed', () => {
    const index = buildMemoryIndex('type', [makeMemory({ id: 'a', type: 'exercise' })], '2026-01-01T00:00:00.000Z')
    const updated = removeMemoryFromIndex(index, 'does-not-exist', '2026-01-02T00:00:00.000Z')
    expect(updated.entries).toEqual(index.entries)
  })
})

describe('rebuildMemoryIndex', () => {
  it('produces the same result as buildMemoryIndex given the same inputs', () => {
    const memories = [makeMemory({ id: 'a', type: 'exercise' })]
    expect(rebuildMemoryIndex('type', memories, '2026-01-01T00:00:00.000Z')).toEqual(
      buildMemoryIndex('type', memories, '2026-01-01T00:00:00.000Z'),
    )
  })

  it('discards any stale entries not reflected in the given memories (a true from-scratch rebuild)', () => {
    const stale = buildMemoryIndex('type', [makeMemory({ id: 'a', type: 'exercise' })], '2026-01-01T00:00:00.000Z')
    const rebuilt = rebuildMemoryIndex('type', [makeMemory({ id: 'b', type: 'milestone' })], '2026-01-02T00:00:00.000Z')
    expect(rebuilt.entries).toEqual([{ key: 'milestone', memoryIds: ['b'] }])
    expect(stale.entries).not.toEqual(rebuilt.entries)
  })
})
