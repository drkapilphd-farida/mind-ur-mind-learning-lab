import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO, makeEmptyULO } from '../testFixtures'
import { startSession } from './startSession'
import { continueSession } from './continueSession'
import { cancelSession } from './cancelSession'
import { restartSession } from './restartSession'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('restartSession', () => {
  it('restarts a mid-progress session with a fresh queue/position/progress/eventLog', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const advanced = continueSession(started.session, ulo, { now: FIXED_NOW, idFactory })
    expect(advanced.success).toBe(true)
    if (!advanced.success) return

    const result = restartSession(advanced.session, ulo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return

    const { session } = result
    expect(session.id).toBe(advanced.session.id)
    expect(session.learnerId).toBe(advanced.session.learnerId)
    expect(session.documentId).toBe(advanced.session.documentId)
    expect(session.status).toBe('active')
    expect(session.position).toEqual({ queueIndex: 0, chunkNodeId: 'chunk-1' })
    expect(session.progress.completedChunkIds).toEqual([])
    expect(session.eventLog).toEqual(result.events)
    expect(session.version.revision).toBe(advanced.session.version.revision + 1)
    expect(session.cancelledAt).toBeNull()
  })

  it('restarts from any status, including cancelled', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const cancelled = cancelSession(started.session, { now: FIXED_NOW, idFactory })
    expect(cancelled.success).toBe(true)
    if (!cancelled.success) return

    const result = restartSession(cancelled.session, ulo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.session.status).toBe('active')
    expect(result.session.cancelledAt).toBeNull()
  })

  it('restarts against a real empty-queue ULO into a completed session', async () => {
    const ulo = await makeULO()
    const emptyUlo = await makeEmptyULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = restartSession(started.session, emptyUlo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.session.status).toBe('completed')
    expect(result.session.uloId).toBe(emptyUlo.id)
    expect(result.session.progress.completionPercentage).toBe(1)
  })
})
