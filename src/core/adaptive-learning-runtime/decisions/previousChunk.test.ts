import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { continueRuntime } from './continueRuntime'
import { previousChunk } from './previousChunk'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('previousChunk', () => {
  it('moves back to the real prior scheduled item without altering progress', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')
    const advanced = continueRuntime(started.state, ulo, { now: FIXED_NOW, idFactory })
    if (!advanced.success) throw new Error('fixture failed')
    expect(advanced.state.position.chunkNodeId).toBe('chunk-2')

    const result = previousChunk(advanced.state, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.position.chunkNodeId).toBe('chunk-1')
    expect(result.state.progress).toEqual(advanced.state.progress)
    expect(result.state.progress.completedChunkIds).toEqual(['chunk-1'])
    expect(result.events[0]).toMatchObject({ type: 'chunk-started', chunkNodeId: 'chunk-1' })
  })

  it('rejects navigating back from the first chunk', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = previousChunk(started.state, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('no-previous-chunk')
  })

  it('rejects navigating back on a paused runtime', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')
    const paused = { ...started.state, session: { ...started.state.session, status: 'paused' as const } }

    const result = previousChunk(paused, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('invalid-transition')
  })

  it('re-applies chunk scheduling so a real revisit mark since the last advance is reflected', async () => {
    const ulo = await makeULO()
    // adaptive-queue with no marks yet sorts by real importance descending:
    // chunk-2 (0.9), chunk-3 (0.6), chunk-1 (0.4).
    const started = startRuntime(ulo, 'learner-1', 'reading', 'adaptive-queue', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')
    expect(started.state.position.chunkNodeId).toBe('chunk-2')

    const advanced = continueRuntime(started.state, ulo, { now: FIXED_NOW, idFactory })
    if (!advanced.success) throw new Error('fixture failed')
    expect(advanced.state.position.chunkNodeId).toBe('chunk-3')

    // Mark the not-yet-visited chunk-1 for revisit — it should float to the
    // front on the next real scheduling pass, ahead of chunk-2.
    const withRevisit = { ...advanced.state, revisitChunkIds: ['chunk-1'] }
    const result = previousChunk(withRevisit, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.scheduledQueue.items[0]?.chunkNodeId).toBe('chunk-1')
    expect(result.state.position.chunkNodeId).toBe('chunk-2')
  })
})
