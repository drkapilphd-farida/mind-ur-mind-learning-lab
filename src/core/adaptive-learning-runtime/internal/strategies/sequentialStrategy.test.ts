import { describe, expect, it } from 'vitest'
import { makeQueue } from '../../testFixtures'
import { applySequentialStrategy } from './sequentialStrategy'

describe('applySequentialStrategy', () => {
  it('returns the real natural document order unchanged', async () => {
    const queue = await makeQueue()
    const result = applySequentialStrategy(queue)

    expect(result.items.map((item) => item.chunkNodeId)).toEqual(queue.items.map((item) => item.chunkNodeId))
  })

  it('returns a new array, not the same queue reference', async () => {
    const queue = await makeQueue()
    const result = applySequentialStrategy(queue)

    expect(result).not.toBe(queue)
    expect(result.items).not.toBe(queue.items)
  })
})
