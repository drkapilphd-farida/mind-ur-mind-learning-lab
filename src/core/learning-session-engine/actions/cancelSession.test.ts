import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startSession } from './startSession'
import { pauseSession } from './pauseSession'
import { cancelSession } from './cancelSession'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('cancelSession', () => {
  it('cancels an active session with no new event type (disclosed gap, not fabricated)', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = cancelSession(started.session, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.session.status).toBe('cancelled')
    expect(result.session.cancelledAt).toBe('2026-01-01T00:00:00.000Z')
    expect(result.events).toEqual([])
    expect(result.session.eventLog).toEqual(started.session.eventLog)
  })

  it('cancels a paused session', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const paused = pauseSession(started.session, { now: FIXED_NOW, idFactory })
    expect(paused.success).toBe(true)
    if (!paused.success) return

    const result = cancelSession(paused.session, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.session.status).toBe('cancelled')
  })

  it('rejects cancelling an already-completed session', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const cancelled = cancelSession(started.session, { now: FIXED_NOW, idFactory })
    expect(cancelled.success).toBe(true)
    if (!cancelled.success) return

    const result = cancelSession(cancelled.session, { now: FIXED_NOW, idFactory })
    expect(result).toEqual({ success: false, error: { code: 'invalid-transition', message: 'Cannot "cancel" a session in status "cancelled".' } })
  })
})
