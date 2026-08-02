import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from '../../testFixtures'
import { applyAdaptiveQueueStrategy } from './adaptiveQueueStrategy'

describe('applyAdaptiveQueueStrategy', () => {
  it('pulls a chunk marked for revisit to the front', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyAdaptiveQueueStrategy(queue, ulo, ['chunk-3'], [])

    expect(result.items[0]!.chunkNodeId).toBe('chunk-3')
  })

  it('sinks a skipped chunk to the back', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyAdaptiveQueueStrategy(queue, ulo, [], ['chunk-1'])

    expect(result.items.at(-1)!.chunkNodeId).toBe('chunk-1')
  })

  it('with no revisit/skip marks, orders the remaining chunks by real importance descending', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyAdaptiveQueueStrategy(queue, ulo, [], [])

    // Same real, authored importance as priority-first: chunk-2 (0.9) > chunk-3 (0.6) > chunk-1 (0.4).
    expect(result.items.map((item) => item.chunkNodeId)).toEqual(['chunk-2', 'chunk-3', 'chunk-1'])
  })

  it('returns the same set of items as the input queue, never dropping or duplicating', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyAdaptiveQueueStrategy(queue, ulo, ['chunk-2'], ['chunk-1'])

    expect(result.items).toHaveLength(queue.items.length)
    expect(new Set(result.items.map((item) => item.chunkNodeId))).toEqual(new Set(queue.items.map((item) => item.chunkNodeId)))
  })
})
