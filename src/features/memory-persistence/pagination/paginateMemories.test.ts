import { describe, expect, it } from 'vitest'
import { paginateMemories } from './paginateMemories'
import { makeMemory } from '../testFixtures'

describe('paginateMemories', () => {
  const memories = [
    makeMemory({ id: 'a' }),
    makeMemory({ id: 'b' }),
    makeMemory({ id: 'c' }),
    makeMemory({ id: 'd' }),
    makeMemory({ id: 'e' }),
  ]

  it('returns everything from offset onward when limit is null', () => {
    expect(paginateMemories(memories, null, 2).map((m) => m.id)).toEqual(['c', 'd', 'e'])
  })

  it('applies both limit and offset', () => {
    expect(paginateMemories(memories, 2, 1).map((m) => m.id)).toEqual(['b', 'c'])
  })

  it('returns the full list for offset 0 and limit null', () => {
    expect(paginateMemories(memories, null, 0).map((m) => m.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('returns an empty list when offset is beyond the end', () => {
    expect(paginateMemories(memories, 10, 100)).toEqual([])
  })

  it('returns an empty list for a limit of 0', () => {
    expect(paginateMemories(memories, 0, 0)).toEqual([])
  })

  it('returns fewer than limit items when limit exceeds the remaining items', () => {
    expect(paginateMemories(memories, 10, 3).map((m) => m.id)).toEqual(['d', 'e'])
  })
})
