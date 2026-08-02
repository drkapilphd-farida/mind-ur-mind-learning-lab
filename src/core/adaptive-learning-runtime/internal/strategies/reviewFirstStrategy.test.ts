import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from '../../testFixtures'
import { applyReviewFirstStrategy } from './reviewFirstStrategy'

describe('applyReviewFirstStrategy', () => {
  it('orders chunks by the real ULO memoryBlueprint memoryDifficulty, descending', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyReviewFirstStrategy(queue, ulo)

    const memoryDifficultyByChunkId = new Map(ulo.learning.memoryBlueprint.entries.map((entry) => [entry.chunkNodeId, entry.memoryDifficulty]))
    const expectedOrder = [...queue.items].sort((a, b) => (memoryDifficultyByChunkId.get(b.chunkNodeId) ?? 0) - (memoryDifficultyByChunkId.get(a.chunkNodeId) ?? 0)).map((item) => item.chunkNodeId)

    expect(result.items.map((item) => item.chunkNodeId)).toEqual(expectedOrder)
  })

  it('returns the same set of items as the input queue, never dropping or duplicating', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyReviewFirstStrategy(queue, ulo)

    expect(result.items).toHaveLength(queue.items.length)
    expect(new Set(result.items.map((item) => item.chunkNodeId))).toEqual(new Set(queue.items.map((item) => item.chunkNodeId)))
  })
})
