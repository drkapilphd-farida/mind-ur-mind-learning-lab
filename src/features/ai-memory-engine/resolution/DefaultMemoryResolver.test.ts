import { describe, expect, it } from 'vitest'
import { createMemoryResolver } from './DefaultMemoryResolver'
import { makeMemoryRecord, makeMemoryStore } from '../testFixtures'

describe('DefaultMemoryResolver', () => {
  const resolver = createMemoryResolver()

  it('returns only the given learner’s non-expired records', () => {
    const store = makeMemoryStore([
      makeMemoryRecord({ id: 'a', learnerId: 'learner-1', expiresAt: null }),
      makeMemoryRecord({ id: 'b', learnerId: 'learner-1', expiresAt: '2020-01-01T00:00:00.000Z' }),
      makeMemoryRecord({ id: 'c', learnerId: 'learner-2', expiresAt: null }),
    ])
    const result = resolver.resolve(store, 'learner-1', '2026-01-01T00:00:00.000Z')
    expect(result.map((record) => record.id)).toEqual(['a'])
  })

  it('narrows to the given categories when provided', () => {
    const store = makeMemoryStore([
      makeMemoryRecord({ id: 'a', learnerId: 'learner-1', category: 'exercise' }),
      makeMemoryRecord({ id: 'b', learnerId: 'learner-1', category: 'milestone' }),
    ])
    const result = resolver.resolve(store, 'learner-1', '2026-01-01T00:00:00.000Z', ['milestone'])
    expect(result.map((record) => record.id)).toEqual(['b'])
  })

  it('returns every category when none is specified', () => {
    const store = makeMemoryStore([makeMemoryRecord({ id: 'a', category: 'exercise' }), makeMemoryRecord({ id: 'b', category: 'milestone' })])
    expect(resolver.resolve(store, 'learner-1', '2026-01-01T00:00:00.000Z')).toHaveLength(2)
  })
})
