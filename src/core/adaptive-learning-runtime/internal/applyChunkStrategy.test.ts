import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from '../testFixtures'
import { applyChunkStrategy } from './applyChunkStrategy'

describe('applyChunkStrategy', () => {
  it('dispatches sequential to real natural document order', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyChunkStrategy('sequential', queue, ulo, [], [])

    expect(result.items.map((item) => item.chunkNodeId)).toEqual(queue.items.map((item) => item.chunkNodeId))
  })

  it('dispatches priority-first to real importance-descending order', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyChunkStrategy('priority-first', queue, ulo, [], [])

    expect(result.items.map((item) => item.chunkNodeId)).toEqual(['chunk-2', 'chunk-3', 'chunk-1'])
  })

  it('dispatches adaptive-queue with real runtime revisit/skip state', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyChunkStrategy('adaptive-queue', queue, ulo, ['chunk-3'], [])

    expect(result.items[0]!.chunkNodeId).toBe('chunk-3')
  })
})
