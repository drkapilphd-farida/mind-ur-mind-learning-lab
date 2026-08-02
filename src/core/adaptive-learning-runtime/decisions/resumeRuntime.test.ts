import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { pauseRuntime } from './pauseRuntime'
import { resumeRuntime } from './resumeRuntime'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('resumeRuntime', () => {
  it('delegates to LSE-1 resumeSession and restores active status', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')
    const paused = pauseRuntime(started.state, { now: FIXED_NOW, idFactory })
    if (!paused.success) throw new Error('fixture failed')

    const result = resumeRuntime(paused.state, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.session.status).toBe('active')
    expect(result.events).toEqual([{ id: expect.any(String), type: 'runtime-resumed', occurredAt: '2026-01-01T00:00:00.000Z' }])
  })

  it('rejects resuming an active runtime', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = resumeRuntime(started.state, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(false)
    expect(!result.success && result.error.code).toBe('invalid-transition')
  })
})
