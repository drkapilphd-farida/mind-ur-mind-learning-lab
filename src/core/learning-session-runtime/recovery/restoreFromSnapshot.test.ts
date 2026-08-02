import { describe, expect, it } from 'vitest'
import { continueRuntime, repeatChunk, revisitLater, skipChunk } from '@/core/adaptive-learning-runtime'
import { FIXED_NOW, makeIdFactory, makeRuntime, makeULO } from '../testFixtures'
import { buildSessionSnapshot } from '../buildSessionSnapshot'
import { restoreFromSnapshot } from './restoreFromSnapshot'

describe('restoreFromSnapshot', () => {
  it('restores a fresh, untouched runtime back to its real starting position', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const snapshot = buildSessionSnapshot(runtime, { now: FIXED_NOW })

    const result = restoreFromSnapshot(snapshot, ulo, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.position).toEqual(runtime.position)
    expect(result.state.progress.completedChunkIds).toEqual([])
  })

  it('replays real completions, skips, repeats, and revisit marks back to the exact same resumed position', async () => {
    const ulo = await makeULO()
    const idFactory = makeIdFactory()
    const started = await makeRuntime(ulo)

    const repeated = repeatChunk(started, { now: FIXED_NOW, idFactory })
    if (!repeated.success) throw new Error('unexpected failure')
    const revisited = revisitLater(repeated.state, { now: FIXED_NOW, idFactory })
    if (!revisited.success) throw new Error('unexpected failure')
    const continued = continueRuntime(revisited.state, ulo, { now: FIXED_NOW, idFactory })
    if (!continued.success) throw new Error('unexpected failure')
    const skipped = skipChunk(continued.state, ulo, { now: FIXED_NOW, idFactory })
    if (!skipped.success) throw new Error('unexpected failure')

    const snapshot = buildSessionSnapshot(skipped.state, { now: FIXED_NOW })
    const result = restoreFromSnapshot(snapshot, ulo, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.position).toEqual(skipped.state.position)
    expect(result.state.progress.completedChunkIds).toEqual(skipped.state.progress.completedChunkIds)
    expect(new Set(result.state.skippedChunkIds)).toEqual(new Set(skipped.state.skippedChunkIds))
    expect(result.state.revisitChunkIds).toEqual(skipped.state.revisitChunkIds)
    expect(result.state.repeatCounts).toEqual(skipped.state.repeatCounts)
    expect(result.state.progress.completionPercentage).toBe(skipped.state.progress.completionPercentage)
  })

  it('rejects restoring a snapshot against the wrong ULO', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const snapshot = buildSessionSnapshot(runtime, { now: FIXED_NOW })
    const otherUlo = { ...(await makeULO()), id: 'a-different-ulo-id' }

    const result = restoreFromSnapshot(snapshot, otherUlo, { now: FIXED_NOW, idFactory: makeIdFactory() })
    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('ulo-mismatch')
  })
})
