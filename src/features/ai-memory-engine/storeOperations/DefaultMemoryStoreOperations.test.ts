import { describe, expect, it } from 'vitest'
import { createMemoryStoreOperations } from './DefaultMemoryStoreOperations'
import { makeMemoryRecord, makeMemoryStore } from '../testFixtures'

describe('DefaultMemoryStoreOperations', () => {
  const ops = createMemoryStoreOperations()

  it('add appends without mutating the original store', () => {
    const original = makeMemoryStore([])
    const record = makeMemoryRecord()
    const result = ops.add(original, record)

    expect(original.records).toHaveLength(0)
    expect(result.records).toEqual([record])
  })

  it('getByLearner returns only that learner’s records', () => {
    const store = makeMemoryStore([makeMemoryRecord({ id: 'a', learnerId: 'learner-1' }), makeMemoryRecord({ id: 'b', learnerId: 'learner-2' })])
    expect(ops.getByLearner(store, 'learner-1').map((record) => record.id)).toEqual(['a'])
  })

  it('getByCategory filters by both learner and category', () => {
    const store = makeMemoryStore([
      makeMemoryRecord({ id: 'a', learnerId: 'learner-1', category: 'exercise' }),
      makeMemoryRecord({ id: 'b', learnerId: 'learner-1', category: 'milestone' }),
      makeMemoryRecord({ id: 'c', learnerId: 'learner-2', category: 'exercise' }),
    ])
    expect(ops.getByCategory(store, 'learner-1', 'exercise').map((record) => record.id)).toEqual(['a'])
  })

  it('removeExpired drops only records whose expiresAt has passed', () => {
    const store = makeMemoryStore([
      makeMemoryRecord({ id: 'expired', expiresAt: '2026-01-01T00:00:00.000Z' }),
      makeMemoryRecord({ id: 'fresh', expiresAt: '2026-06-01T00:00:00.000Z' }),
      makeMemoryRecord({ id: 'permanent', expiresAt: null }),
    ])
    const result = ops.removeExpired(store, '2026-02-01T00:00:00.000Z')
    expect(result.records.map((record) => record.id).sort()).toEqual(['fresh', 'permanent'])
  })
})
