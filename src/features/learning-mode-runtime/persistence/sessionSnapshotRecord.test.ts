import { describe, expect, it } from 'vitest'
import { makeSessionSnapshot } from '../testFixtures'
import { fromSessionRecord, toSessionRecord } from './sessionSnapshotRecord'

describe('sessionSnapshotRecord', () => {
  it('round-trips a real SessionSnapshot through the record shape without loss', async () => {
    const { snapshot } = await makeSessionSnapshot()
    const record = toSessionRecord(snapshot)

    expect(record.id).toBe(snapshot.sessionId)
    expect(record.user_id).toBe(snapshot.learnerId)
    expect(record.session_type).toBe('reading')
    expect(record.status).toBe('in_progress')

    const restored = fromSessionRecord(record.data)
    expect(restored).toEqual(snapshot)
  })

  it('derives session_type from the snapshot itself, for a non-reading mode too', async () => {
    const { snapshot } = await makeSessionSnapshot('learner-1', 'memory')
    const record = toSessionRecord(snapshot)

    expect(record.session_type).toBe('memory')
  })

  it('maps real completed/cancelled status to their real DB counterparts, and everything else to in_progress', async () => {
    const { snapshot } = await makeSessionSnapshot()

    expect(toSessionRecord({ ...snapshot, status: 'completed' }).status).toBe('completed')
    expect(toSessionRecord({ ...snapshot, status: 'cancelled' }).status).toBe('abandoned')
    expect(toSessionRecord({ ...snapshot, status: 'not-started' }).status).toBe('in_progress')
    expect(toSessionRecord({ ...snapshot, status: 'active' }).status).toBe('in_progress')
    expect(toSessionRecord({ ...snapshot, status: 'paused' }).status).toBe('in_progress')
  })

  it('returns null, honestly, for data that is not shaped like a real SessionSnapshot', () => {
    expect(fromSessionRecord({ not: 'a snapshot' })).toBeNull()
    expect(fromSessionRecord(null)).toBeNull()
  })
})
