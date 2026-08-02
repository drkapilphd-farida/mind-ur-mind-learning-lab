import { describe, expect, it } from 'vitest'
import { memoriesEqual } from './memoriesEqual'
import { makeMemory } from '../testFixtures'

describe('memoriesEqual', () => {
  it('returns true for two null values', () => {
    expect(memoriesEqual(null, null)).toBe(true)
  })

  it('returns false when one side is null and the other is not', () => {
    expect(memoriesEqual(makeMemory(), null)).toBe(false)
    expect(memoriesEqual(null, makeMemory())).toBe(false)
  })

  it('returns true for two structurally identical memories', () => {
    expect(memoriesEqual(makeMemory({ id: 'a' }), makeMemory({ id: 'a' }))).toBe(true)
  })

  it('returns false for memories differing in a nested field', () => {
    const a = makeMemory({ id: 'a', metadata: { learnerId: 'l', source: 's', tags: ['x'] } })
    const b = makeMemory({ id: 'a', metadata: { learnerId: 'l', source: 's', tags: ['y'] } })
    expect(memoriesEqual(a, b)).toBe(false)
  })
})
