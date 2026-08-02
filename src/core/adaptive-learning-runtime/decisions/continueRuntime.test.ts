import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { continueRuntime } from './continueRuntime'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('continueRuntime', () => {
  it('completes the current chunk and advances to the real next scheduled item', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = continueRuntime(started.state, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.state.progress.completedChunkIds).toEqual(['chunk-1'])
    expect(result.state.position.chunkNodeId).toBe('chunk-2')
    expect(result.events[0]).toMatchObject({ type: 'chunk-completed', chunkNodeId: 'chunk-1' })
    expect(result.events.some((event) => event.type === 'chunk-started' && event.chunkNodeId === 'chunk-2')).toBe(true)
  })

  it('re-applies chunk scheduling on every call so a revisit-later mark since the last advance is reflected', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'adaptive-queue', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const withRevisit = { ...started.state, revisitChunkIds: ['chunk-3'] }
    const result = continueRuntime(withRevisit, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.state.position.chunkNodeId).toBe('chunk-3')
  })

  it('delegates to LSE-1 completeSession once the scheduled queue is exhausted', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    let state = started.state
    for (let i = 0; i < 3; i += 1) {
      const result = continueRuntime(state, ulo, { now: FIXED_NOW, idFactory })
      if (!result.success) throw new Error('unexpected failure')
      state = result.state
    }

    expect(state.session.status).toBe('completed')
    expect(state.progress.completionPercentage).toBe(1)
    expect(state.position).toEqual({ queueIndex: 3, chunkNodeId: null })
  })

  it('rejects continuing a paused runtime', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const paused = { ...started.state, session: { ...started.state.session, status: 'paused' as const } }
    const result = continueRuntime(paused, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('invalid-transition')
  })
})
