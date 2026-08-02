import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startSession } from './startSession'
import { completeSession } from './completeSession'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('completeSession', () => {
  it('explicitly completes an active session early, treating all items as done', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = completeSession(started.session, ulo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.session.status).toBe('completed')
    expect(result.session.completedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(result.session.progress.completionPercentage).toBe(1)
    expect(result.session.progress.remainingChunkIds).toEqual([])
    expect(result.events.map((event) => event.type)).toEqual(['progress-updated', 'session-completed'])
  })

  it('rejects completing a session that is not active', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const first = completeSession(started.session, ulo, { now: FIXED_NOW, idFactory })
    expect(first.success).toBe(true)
    if (!first.success) return

    const result = completeSession(first.session, ulo, { now: FIXED_NOW, idFactory })
    expect(result).toEqual({ success: false, error: { code: 'invalid-transition', message: 'Cannot "complete" a session in status "completed".' } })
  })

  it('rejects completing a session built against a different ULO', async () => {
    const ulo = await makeULO()
    const otherUlo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = completeSession(started.session, otherUlo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.code).toBe('ulo-mismatch')
  })
})
