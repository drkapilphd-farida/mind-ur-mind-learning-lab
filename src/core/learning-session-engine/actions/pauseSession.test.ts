import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startSession } from './startSession'
import { pauseSession } from './pauseSession'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('pauseSession', () => {
  it('pauses an active session, leaving queue/position/progress untouched', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = pauseSession(started.session, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.session.status).toBe('paused')
    expect(result.session.position).toEqual(started.session.position)
    expect(result.session.progress).toEqual(started.session.progress)
    expect(result.session.version.revision).toBe(2)
    expect(result.events).toEqual([{ id: expect.any(String), type: 'session-paused', occurredAt: '2026-01-01T00:00:00.000Z' }])
    expect(result.session.eventLog).toEqual([...started.session.eventLog, ...result.events])
  })

  it('rejects pausing a session that is not active', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const paused = pauseSession(started.session, { now: FIXED_NOW, idFactory })
    expect(paused.success).toBe(true)
    if (!paused.success) return

    const result = pauseSession(paused.session, { now: FIXED_NOW, idFactory })
    expect(result).toEqual({ success: false, error: { code: 'invalid-transition', message: 'Cannot "pause" a session in status "paused".' } })
  })
})
