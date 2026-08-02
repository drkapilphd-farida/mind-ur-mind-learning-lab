import { describe, expect, it, vi } from 'vitest'
import { startRuntime } from '@/core/adaptive-learning-runtime'
import { FIXED_NOW, makeIdFactory, makeLearningMode, makeULO } from './testFixtures'
import { dispatchRuntimeEvents } from './dispatchRuntimeEvents'

describe('dispatchRuntimeEvents', () => {
  it('is a real, honest no-op when the mode has no adapter registered', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    expect(() => dispatchRuntimeEvents(makeLearningMode(), ulo, started.state, started.events)).not.toThrow()
  })

  it('calls onChunkStarted with the real resolved chunk for a real chunk-started event', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const onChunkStarted = vi.fn()
    const mode = makeLearningMode({ adapter: { type: 'quantum-speed-reading', onChunkStarted } })

    dispatchRuntimeEvents(mode, ulo, started.state, started.events)

    expect(onChunkStarted).toHaveBeenCalledTimes(1)
    expect(onChunkStarted).toHaveBeenCalledWith(started.state, expect.objectContaining({ id: 'chunk-1' }))
  })

  it('calls onCheckpointReached with the real event for a real checkpoint-reached event, and onRuntimeCompleted for a real runtime-completed event', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const onCheckpointReached = vi.fn()
    const onRuntimeCompleted = vi.fn()
    const mode = makeLearningMode({ adapter: { type: 'quantum-speed-reading', onCheckpointReached, onRuntimeCompleted } })

    const syntheticEvents = [
      { id: 'e-cp', type: 'checkpoint-reached' as const, occurredAt: FIXED_NOW().toISOString(), conceptNodeId: 'concept-1', label: 'Concept One' },
      { id: 'e-done', type: 'runtime-completed' as const, occurredAt: FIXED_NOW().toISOString() },
    ]

    dispatchRuntimeEvents(mode, ulo, started.state, syntheticEvents)

    expect(onCheckpointReached).toHaveBeenCalledWith(started.state, syntheticEvents[0])
    expect(onRuntimeCompleted).toHaveBeenCalledWith(started.state)
  })

  it('silently skips progress-updated, runtime-paused, and runtime-resumed — no matching hook exists', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const onRuntimeStarted = vi.fn()
    const mode = makeLearningMode({ adapter: { type: 'quantum-speed-reading', onRuntimeStarted } })

    const syntheticEvents = [
      { id: 'e1', type: 'progress-updated' as const, occurredAt: FIXED_NOW().toISOString(), completionPercentage: 0.5 },
      { id: 'e2', type: 'runtime-paused' as const, occurredAt: FIXED_NOW().toISOString() },
      { id: 'e3', type: 'runtime-resumed' as const, occurredAt: FIXED_NOW().toISOString() },
    ]

    expect(() => dispatchRuntimeEvents(mode, ulo, started.state, syntheticEvents)).not.toThrow()
    expect(onRuntimeStarted).not.toHaveBeenCalled()
  })
})
