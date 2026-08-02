import { describe, expect, it } from 'vitest'
import { computeIndexStatistics } from './computeIndexStatistics'
import { makeIndexEntry, makeMemory, makeMemoryIndex } from '../testFixtures'

describe('computeIndexStatistics', () => {
  it('entryCount is the number of distinct entries', () => {
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['a'] }), makeIndexEntry({ key: 'milestone', memoryIds: ['b'] })],
    })
    const memories = [makeMemory({ id: 'a', type: 'exercise' }), makeMemory({ id: 'b', type: 'milestone' })]
    expect(computeIndexStatistics(index, memories, null).entryCount).toBe(2)
  })

  it('indexSize is the total number of (key, memoryId) associations, not the entry count', () => {
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['a', 'b'] })],
    })
    const memories = [makeMemory({ id: 'a', type: 'exercise' }), makeMemory({ id: 'b', type: 'exercise' })]
    const stats = computeIndexStatistics(index, memories, null)
    expect(stats.entryCount).toBe(1)
    expect(stats.indexSize).toBe(2)
  })

  it('passes lastRebuildAt through unchanged', () => {
    const index = makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' }, entries: [] })
    expect(computeIndexStatistics(index, [], '2026-06-01T00:00:00.000Z').lastRebuildAt).toBe('2026-06-01T00:00:00.000Z')
    expect(computeIndexStatistics(index, [], null).lastRebuildAt).toBeNull()
  })

  it('healthStatus is healthy for a consistent index', () => {
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['a'] })],
    })
    expect(computeIndexStatistics(index, [memory], null).healthStatus).toBe('healthy')
  })

  it('healthStatus is invalid for an inconsistent index', () => {
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['does-not-exist'] })],
    })
    expect(computeIndexStatistics(index, [], null).healthStatus).toBe('invalid')
  })

  it('echoes the index type from the given index', () => {
    const index = makeMemoryIndex({ metadata: { indexType: 'importance', createdAt: 'x', updatedAt: 'x' }, entries: [] })
    expect(computeIndexStatistics(index, [], null).indexType).toBe('importance')
  })
})
