import { describe, expect, it } from 'vitest'
import { startRuntime } from '@/core/adaptive-learning-runtime'
import { computeRuntimeMetrics } from '@/core/learning-session-runtime'
import { FIXED_NOW, makeIdFactory, makeLearningMode, makeULO } from './testFixtures'
import { synchronizeModeProgress } from './synchronizeModeProgress'

describe('synchronizeModeProgress', () => {
  it('combines the real LSE-2 progress and real LSE-3 metrics under the real mode identity', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const mode = makeLearningMode()
    const synchronized = synchronizeModeProgress(mode, started.state)

    expect(synchronized.mode).toBe('quantum-speed-reading')
    expect(synchronized.progress).toBe(started.state.progress)
    expect(synchronized.metrics).toEqual(computeRuntimeMetrics(started.state))
  })
})
