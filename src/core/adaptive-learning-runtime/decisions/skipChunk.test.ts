import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { skipChunk } from './skipChunk'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('skipChunk', () => {
  it('marks the current chunk skipped and advances to the real next remaining item', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = skipChunk(started.state, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.skippedChunkIds).toEqual(['chunk-1'])
    expect(result.state.position.chunkNodeId).toBe('chunk-2')
    expect(result.state.progress.completedChunkIds).toEqual([])
    expect(result.events[0]).toMatchObject({ type: 'chunk-skipped', chunkNodeId: 'chunk-1' })
  })

  it('a skipped chunk never resurfaces via getNextRemainingItem for the rest of the runtime', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const afterSkip = skipChunk(started.state, ulo, { now: FIXED_NOW, idFactory })
    if (!afterSkip.success) throw new Error('unexpected failure')

    expect(afterSkip.state.scheduledQueue.items.map((item) => item.chunkNodeId)).toContain('chunk-1')
    expect(afterSkip.state.position.chunkNodeId).not.toBe('chunk-1')
  })
})
