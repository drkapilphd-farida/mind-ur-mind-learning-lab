import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { completeRuntime } from './completeRuntime'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('completeRuntime', () => {
  it('completes the runtime early, regardless of remaining scheduled items', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = completeRuntime(started.state, ulo, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.session.status).toBe('completed')
    expect(result.state.progress.completionPercentage).toBe(1)
    expect(result.state.position).toEqual({ queueIndex: 3, chunkNodeId: null })
    expect(result.events.map((event) => event.type)).toEqual(['progress-updated', 'runtime-completed'])
  })

  it('rejects completing an already-completed runtime', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')
    const completed = completeRuntime(started.state, ulo, { now: FIXED_NOW, idFactory })
    if (!completed.success) throw new Error('unexpected failure')

    const result = completeRuntime(completed.state, ulo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('invalid-transition')
  })
})
