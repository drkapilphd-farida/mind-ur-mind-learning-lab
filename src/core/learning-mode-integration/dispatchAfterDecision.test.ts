import { describe, expect, it, vi } from 'vitest'
import { continueRuntime, startRuntime } from '@/core/adaptive-learning-runtime'
import { FIXED_NOW, makeIdFactory, makeLearningMode, makeULO } from './testFixtures'
import { dispatchAfterDecision } from './dispatchAfterDecision'

describe('dispatchAfterDecision', () => {
  it('forwards real events to the mode adapter on a real successful decision, and returns the decision result unchanged', async () => {
    const ulo = await makeULO()
    const idFactory = makeIdFactory()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const onChunkCompleted = vi.fn()
    const mode = makeLearningMode({ adapter: { type: 'quantum-speed-reading', onChunkCompleted } })

    const decisionResult = continueRuntime(started.state, ulo, { now: FIXED_NOW, idFactory })
    const dispatched = dispatchAfterDecision(mode, ulo, decisionResult)

    expect(dispatched).toBe(decisionResult)
    expect(onChunkCompleted).toHaveBeenCalledTimes(1)
  })

  it('never forwards events on a real failed decision', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const onChunkCompleted = vi.fn()
    const mode = makeLearningMode({ adapter: { type: 'quantum-speed-reading', onChunkCompleted } })

    const paused = { ...started.state, session: { ...started.state.session, status: 'paused' as const } }
    const decisionResult = continueRuntime(paused, ulo, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(decisionResult.success).toBe(false)
    dispatchAfterDecision(mode, ulo, decisionResult)
    expect(onChunkCompleted).not.toHaveBeenCalled()
  })
})
