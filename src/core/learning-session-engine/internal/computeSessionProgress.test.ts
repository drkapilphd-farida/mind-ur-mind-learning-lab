import { describe, expect, it } from 'vitest'
import { buildLearningQueue } from './buildLearningQueue'
import { computeSessionProgress } from './computeSessionProgress'
import { makeEmptyULO, makeULO } from '../testFixtures'

describe('computeSessionProgress', () => {
  it('computes 0% completion with zero completed chunks', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)
    const progress = computeSessionProgress(queue, [], ulo)

    expect(progress.completionPercentage).toBe(0)
    expect(progress.completedChunkIds).toEqual([])
    expect(progress.remainingChunkIds).toHaveLength(queue.items.length)
  })

  it('computes real completion percentage as completed/total', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)
    const firstChunkId = queue.items[0]!.chunkNodeId
    const progress = computeSessionProgress(queue, [firstChunkId], ulo)

    expect(progress.completionPercentage).toBeCloseTo(1 / queue.items.length, 10)
    expect(progress.remainingChunkIds).not.toContain(firstChunkId)
  })

  it('sums the real estimatedLearningTimeSeconds of remaining chunks only', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)
    const firstChunkId = queue.items[0]!.chunkNodeId
    const progress = computeSessionProgress(queue, [firstChunkId], ulo)

    const timeByChunkId = new Map(ulo.analysis.chunkAnalyses.map((chunk) => [chunk.chunkNodeId, chunk.estimatedLearningTimeSeconds]))
    const expectedTime = progress.remainingChunkIds.reduce((sum, id) => sum + (timeByChunkId.get(id) ?? 0), 0)
    expect(progress.estimatedTimeLeftSeconds).toBe(expectedTime)
  })

  it('reports 100% completion for a real empty queue, without dividing by zero', async () => {
    const ulo = await makeEmptyULO()
    const queue = buildLearningQueue(ulo)
    const progress = computeSessionProgress(queue, [], ulo)

    expect(progress.completionPercentage).toBe(1)
    expect(progress.estimatedTimeLeftSeconds).toBe(0)
  })

  it('reports 100% completion once every chunk is completed', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)
    const allChunkIds = queue.items.map((item) => item.chunkNodeId)
    const progress = computeSessionProgress(queue, allChunkIds, ulo)

    expect(progress.completionPercentage).toBe(1)
    expect(progress.remainingChunkIds).toEqual([])
    expect(progress.estimatedTimeLeftSeconds).toBe(0)
  })
})
