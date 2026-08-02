import { describe, expect, it } from 'vitest'
import { continueRuntime, repeatChunk, skipChunk } from '@/core/adaptive-learning-runtime'
import { FIXED_NOW, makeIdFactory, makeRuntime, makeULO } from './testFixtures'
import { computeRuntimeMetrics } from './computeRuntimeMetrics'

describe('computeRuntimeMetrics', () => {
  it('reports real zeroed metrics for a freshly started runtime', async () => {
    const runtime = await makeRuntime()
    const metrics = computeRuntimeMetrics(runtime)

    expect(metrics).toEqual({
      totalChunks: 3,
      completedChunks: 0,
      skippedChunks: 0,
      revisitedChunks: 0,
      totalRepeats: 0,
      pauseCount: 0,
      checkpointCount: 0,
    })
  })

  it('reflects real repeats, skips, and completions after real decisions', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const idFactory = makeIdFactory()

    const repeated = repeatChunk(runtime, { now: FIXED_NOW, idFactory })
    if (!repeated.success) throw new Error('unexpected failure')

    const skipped = skipChunk(repeated.state, ulo, { now: FIXED_NOW, idFactory })
    if (!skipped.success) throw new Error('unexpected failure')

    const continued = continueRuntime(skipped.state, ulo, { now: FIXED_NOW, idFactory })
    if (!continued.success) throw new Error('unexpected failure')

    const metrics = computeRuntimeMetrics(continued.state)
    expect(metrics.totalRepeats).toBe(1)
    expect(metrics.skippedChunks).toBe(1)
    expect(metrics.completedChunks).toBe(1)
  })
})
