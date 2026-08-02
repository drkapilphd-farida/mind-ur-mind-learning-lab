import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startSession } from './startSession'
import { continueSession } from './continueSession'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('continueSession', () => {
  it('advances to the next item and stays active', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = continueSession(started.session, ulo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return

    const { session } = result
    expect(session.status).toBe('active')
    expect(session.position).toEqual({ queueIndex: 1, chunkNodeId: 'chunk-2' })
    expect(session.progress.completedChunkIds).toEqual(['chunk-1'])
    expect(session.progress.remainingChunkIds).toEqual(['chunk-2', 'chunk-3'])
    expect(session.progress.completionPercentage).toBeCloseTo(1 / 3)
    expect(session.version.revision).toBe(2)
    expect(session.completedAt).toBeNull()

    expect(result.events[0]).toMatchObject({ type: 'chunk-completed', chunkNodeId: 'chunk-1' })
    expect(result.events.at(-1)).toMatchObject({ type: 'progress-updated' })
    expect(session.eventLog).toEqual([...started.session.eventLog, ...result.events])
  })

  it('walks the full queue to completion and emits session-completed', async () => {
    const ulo = await makeULO()
    const current = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(current.success).toBe(true)
    if (!current.success) return

    let session = current.session
    for (let i = 0; i < 3; i += 1) {
      const step = continueSession(session, ulo, { now: FIXED_NOW, idFactory })
      expect(step.success).toBe(true)
      if (!step.success) return
      session = step.session
    }

    expect(session.status).toBe('completed')
    expect(session.completedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(session.position).toEqual({ queueIndex: 3, chunkNodeId: null })
    expect(session.progress.completionPercentage).toBe(1)
    expect(session.progress.remainingChunkIds).toEqual([])
    expect(session.eventLog.at(-1)).toMatchObject({ type: 'session-completed' })
  })

  it('rejects continuing a session that is not active', async () => {
    const ulo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const notStarted = { ...started.session, status: 'completed' as const }
    const result = continueSession(notStarted, ulo, { now: FIXED_NOW, idFactory })
    expect(result).toEqual({ success: false, error: { code: 'invalid-transition', message: 'Cannot "continue" a session in status "completed".' } })
  })

  it('rejects continuing a session built against a different ULO', async () => {
    const ulo = await makeULO()
    const otherUlo = await makeULO()
    const started = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })
    expect(started.success).toBe(true)
    if (!started.success) return

    const result = continueSession(started.session, otherUlo, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.code).toBe('ulo-mismatch')
  })
})
