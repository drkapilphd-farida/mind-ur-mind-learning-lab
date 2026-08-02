import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from '../../testFixtures'
import { applyPriorityFirstStrategy } from './priorityFirstStrategy'

describe('applyPriorityFirstStrategy', () => {
  it('orders chunks by real enrichment.importance descending', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyPriorityFirstStrategy(queue, ulo)

    // Real, authored importance: chunk-2 (0.9) > chunk-3 (0.6) > chunk-1 (0.4).
    expect(result.items.map((item) => item.chunkNodeId)).toEqual(['chunk-2', 'chunk-3', 'chunk-1'])
  })

  it('returns the same set of items as the input queue, never dropping or duplicating', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyPriorityFirstStrategy(queue, ulo)

    expect(result.items).toHaveLength(queue.items.length)
    expect(new Set(result.items.map((item) => item.chunkNodeId))).toEqual(new Set(queue.items.map((item) => item.chunkNodeId)))
  })
})
