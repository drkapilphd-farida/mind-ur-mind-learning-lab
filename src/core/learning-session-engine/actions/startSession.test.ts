import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeEmptyULO, makeULO } from '../testFixtures'
import { startSession } from './startSession'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('startSession', () => {
  it('starts an active session with the real queue, position, and progress', async () => {
    const ulo = await makeULO()
    const result = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    const { session } = result
    expect(session.status).toBe('active')
    expect(session.learnerId).toBe('learner-1')
    expect(session.sessionType).toBe('reading')
    expect(session.documentId).toBe(ulo.documentId)
    expect(session.uloId).toBe(ulo.id)
    expect(session.uloVersion).toEqual(ulo.version)
    expect(session.queue.items).toHaveLength(3)
    expect(session.position).toEqual({ queueIndex: 0, chunkNodeId: 'chunk-1' })
    expect(session.progress.completedChunkIds).toEqual([])
    expect(session.progress.remainingChunkIds).toEqual(['chunk-1', 'chunk-2', 'chunk-3'])
    expect(session.progress.completionPercentage).toBe(0)
    expect(session.startedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(session.completedAt).toBeNull()
    expect(session.cancelledAt).toBeNull()
    expect(session.version).toEqual({ schemaVersion: '1.0.0', revision: 1 })
  })

  it('emits real position events (including checkpoint-reached where the ULO says so) plus progress-updated', async () => {
    const ulo = await makeULO()
    const result = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.session.eventLog).toEqual(result.events)
    expect(result.events.at(-1)).toMatchObject({ type: 'progress-updated', completionPercentage: 0 })
    const [chunkStarted] = result.events
    expect(chunkStarted).toMatchObject({ type: 'chunk-started', chunkNodeId: 'chunk-1' })
  })

  it('starts a completed session with 100% progress for a real empty-queue ULO', async () => {
    const ulo = await makeEmptyULO()
    const result = startSession(ulo, 'learner-1', 'reading', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    const { session } = result
    expect(session.status).toBe('completed')
    expect(session.completedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(session.position).toEqual({ queueIndex: 0, chunkNodeId: null })
    expect(session.progress.completionPercentage).toBe(1)
    expect(result.events.map((event) => event.type)).toEqual(['progress-updated', 'session-completed'])
  })
})
