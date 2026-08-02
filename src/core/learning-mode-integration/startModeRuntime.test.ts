import { describe, expect, it, vi } from 'vitest'
import { createLearningModeRegistry } from './createLearningModeRegistry'
import { FIXED_NOW, makeIdFactory, makeLearningMode, makeULO } from './testFixtures'
import { startModeRuntime } from './startModeRuntime'

describe('startModeRuntime', () => {
  it('rejects starting a runtime for an unregistered mode', async () => {
    const ulo = await makeULO()
    const registry = createLearningModeRegistry()

    const result = startModeRuntime(registry, 'quantum-speed-reading', ulo, { learnerId: 'learner-1', chunkStrategy: 'sequential' }, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('mode-not-registered')
  })

  it('rejects an unsupported chunk strategy before ever calling into LSE-2', async () => {
    const ulo = await makeULO()
    const registry = createLearningModeRegistry()
    registry.register(makeLearningMode({ capabilities: { sessionType: 'reading', supportedChunkStrategies: ['sequential'], supportsCheckpoints: true } }))

    const result = startModeRuntime(registry, 'quantum-speed-reading', ulo, { learnerId: 'learner-1', chunkStrategy: 'adaptive-queue' }, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('unsupported-chunk-strategy')
  })

  it('starts a real runtime via LSE-2, calls onRuntimeStarted once, and forwards the real initial events', async () => {
    const ulo = await makeULO()
    const registry = createLearningModeRegistry()
    const onRuntimeStarted = vi.fn()
    const onChunkStarted = vi.fn()
    registry.register(makeLearningMode({ adapter: { type: 'quantum-speed-reading', onRuntimeStarted, onChunkStarted } }))

    const result = startModeRuntime(registry, 'quantum-speed-reading', ulo, { learnerId: 'learner-1', chunkStrategy: 'sequential' }, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.session.learnerId).toBe('learner-1')
    expect(onRuntimeStarted).toHaveBeenCalledTimes(1)
    expect(onRuntimeStarted).toHaveBeenCalledWith(result.state)
    expect(onChunkStarted).toHaveBeenCalledTimes(1)
  })

  it('derives sessionType from the mode\'s own declared capabilities, never from the caller', async () => {
    const ulo = await makeULO()
    const registry = createLearningModeRegistry()
    registry.register(makeLearningMode({ type: 'revision', capabilities: { sessionType: 'revision', supportedChunkStrategies: ['sequential'], supportsCheckpoints: false } }))

    const result = startModeRuntime(registry, 'revision', ulo, { learnerId: 'learner-1', chunkStrategy: 'sequential' }, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.session.sessionType).toBe('revision')
  })
})
