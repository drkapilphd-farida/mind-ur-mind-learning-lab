import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from '../testFixtures'
import { computeRuntimeProgress } from './computeRuntimeProgress'

describe('computeRuntimeProgress', () => {
  it('computes 0% completion with zero completed chunks', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const progress = computeRuntimeProgress(queue, [], [], [], ulo)

    expect(progress.completionPercentage).toBe(0)
    expect(progress.remainingChunkIds).toHaveLength(queue.items.length)
    expect(progress.skippedCount).toBe(0)
    expect(progress.revisitCount).toBe(0)
  })

  it('computes real completion percentage as completed/total and real skipped/revisit counts', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const progress = computeRuntimeProgress(queue, ['chunk-1'], ['chunk-2'], ['chunk-3'], ulo)

    expect(progress.completionPercentage).toBeCloseTo(1 / queue.items.length, 10)
    expect(progress.remainingChunkIds).not.toContain('chunk-1')
    expect(progress.skippedCount).toBe(1)
    expect(progress.revisitCount).toBe(1)
  })

  it('reports 100% completion for a real empty queue, without dividing by zero', async () => {
    const progress = computeRuntimeProgress({ items: [] }, [], [], [], await makeULO())

    expect(progress.completionPercentage).toBe(1)
    expect(progress.estimatedTimeLeftSeconds).toBe(0)
  })
})
