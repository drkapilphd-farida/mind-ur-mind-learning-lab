import { describe, expect, it } from 'vitest'
import { createMemorySorter } from './DefaultMemorySorter'
import { makeMemory } from '../testFixtures'

describe('DefaultMemorySorter', () => {
  it('sorts by createdAt ascending', () => {
    const sorter = createMemorySorter()
    const early = makeMemory({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' })
    const late = makeMemory({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z' })
    expect(sorter.sort([late, early], 'createdAt', 'ascending').map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('sorts by createdAt descending', () => {
    const sorter = createMemorySorter()
    const early = makeMemory({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' })
    const late = makeMemory({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z' })
    expect(sorter.sort([early, late], 'createdAt', 'descending').map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('sorts by updatedAt in both directions', () => {
    const sorter = createMemorySorter()
    const older = makeMemory({ id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeMemory({ id: 'b', updatedAt: '2026-01-02T00:00:00.000Z' })
    expect(sorter.sort([older, newer], 'updatedAt', 'descending').map((m) => m.id)).toEqual(['b', 'a'])
    expect(sorter.sort([older, newer], 'updatedAt', 'ascending').map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('sorts by importance descending, most important (critical) first', () => {
    const sorter = createMemorySorter()
    const low = makeMemory({ id: 'a', importance: 'low' })
    const critical = makeMemory({ id: 'b', importance: 'critical' })
    const medium = makeMemory({ id: 'c', importance: 'medium' })
    expect(sorter.sort([low, critical, medium], 'importance', 'descending').map((m) => m.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by importance ascending, least important (temporary) first', () => {
    const sorter = createMemorySorter()
    const critical = makeMemory({ id: 'a', importance: 'critical' })
    const temporary = makeMemory({ id: 'b', importance: 'temporary' })
    expect(sorter.sort([critical, temporary], 'importance', 'ascending').map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('sorts by lastAccessedAt using updatedAt as the proxy field', () => {
    const sorter = createMemorySorter()
    const older = makeMemory({ id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeMemory({ id: 'b', updatedAt: '2026-01-02T00:00:00.000Z' })
    expect(sorter.sort([older, newer], 'lastAccessedAt', 'descending').map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('breaks ties deterministically by id when the sort field value is equal', () => {
    const sorter = createMemorySorter()
    const b = makeMemory({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' })
    const a = makeMemory({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' })
    expect(sorter.sort([b, a], 'createdAt', 'descending').map((m) => m.id)).toEqual(['a', 'b'])
    expect(sorter.sort([b, a], 'createdAt', 'ascending').map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('never mutates the given array — returns a new one', () => {
    const sorter = createMemorySorter()
    const memories = [makeMemory({ id: 'b' }), makeMemory({ id: 'a' })]
    const sorted = sorter.sort(memories, 'createdAt', 'ascending')
    expect(sorted).not.toBe(memories)
    expect(memories.map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('produces identical output order across repeated calls on identical input (deterministic)', () => {
    const sorter = createMemorySorter()
    const memories = [makeMemory({ id: 'c' }), makeMemory({ id: 'a' }), makeMemory({ id: 'b' })]
    const first = sorter.sort(memories, 'importance', 'descending').map((m) => m.id)
    const second = sorter.sort(memories, 'importance', 'descending').map((m) => m.id)
    expect(first).toEqual(second)
  })
})
