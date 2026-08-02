import { describe, expect, it } from 'vitest'
import { createContextSnapshotService } from './DefaultContextSnapshotService'
import { makeContextEntry, makeContextSnapshot, makeFixedClock, makeSequentialIdGenerator, makeSessionContext } from '../testFixtures'

describe('DefaultContextSnapshotService', () => {
  it('createSnapshot() captures the session id, entries, and a generated id/timestamp', () => {
    const service = createContextSnapshotService({
      clock: makeFixedClock('2026-02-01T00:00:00.000Z'),
      idGenerator: makeSequentialIdGenerator('snapshot'),
    })
    const context = makeSessionContext({ id: 'session-1', entries: [makeContextEntry({ id: 'a' })] })
    const snapshot = service.createSnapshot(context)

    expect(snapshot).toEqual({
      id: 'snapshot-1',
      sessionId: 'session-1',
      entries: [makeContextEntry({ id: 'a' })],
      capturedAt: '2026-02-01T00:00:00.000Z',
    })
  })

  it('createSnapshot() copies entries into a new array — later mutation of the source cannot affect it', () => {
    const service = createContextSnapshotService()
    const entries = [makeContextEntry({ id: 'a' })]
    const context = makeSessionContext({ entries })
    const snapshot = service.createSnapshot(context)
    expect(snapshot.entries).not.toBe(entries)
  })

  it('restoreSnapshot() returns a new array containing the snapshot entries', () => {
    const service = createContextSnapshotService()
    const snapshot = makeContextSnapshot({ entries: [makeContextEntry({ id: 'a' })] })
    const restored = service.restoreSnapshot(snapshot)
    expect(restored).toEqual(snapshot.entries)
    expect(restored).not.toBe(snapshot.entries)
  })

  it('compareSnapshots() reports added, removed, and unchanged entries by id', () => {
    const service = createContextSnapshotService()
    const base = makeContextSnapshot({ entries: [makeContextEntry({ id: 'a' }), makeContextEntry({ id: 'b' })] })
    const next = makeContextSnapshot({ entries: [makeContextEntry({ id: 'b' }), makeContextEntry({ id: 'c' })] })
    const comparison = service.compareSnapshots(base, next)

    expect(comparison.added.map((e) => e.id)).toEqual(['c'])
    expect(comparison.removed.map((e) => e.id)).toEqual(['a'])
    expect(comparison.unchanged.map((e) => e.id)).toEqual(['b'])
  })

  it('compareSnapshots() reports no differences for two identical snapshots', () => {
    const service = createContextSnapshotService()
    const entries = [makeContextEntry({ id: 'a' })]
    const snapshot = makeContextSnapshot({ entries })
    const comparison = service.compareSnapshots(snapshot, snapshot)

    expect(comparison.added).toEqual([])
    expect(comparison.removed).toEqual([])
    expect(comparison.unchanged.map((e) => e.id)).toEqual(['a'])
  })

  it('validateSnapshotIntegrity() accepts a well-formed snapshot', () => {
    const service = createContextSnapshotService()
    expect(service.validateSnapshotIntegrity(makeContextSnapshot())).toBe(true)
  })

  it('validateSnapshotIntegrity() rejects an empty id', () => {
    const service = createContextSnapshotService()
    expect(service.validateSnapshotIntegrity(makeContextSnapshot({ id: '' }))).toBe(false)
  })

  it('validateSnapshotIntegrity() rejects an empty sessionId', () => {
    const service = createContextSnapshotService()
    expect(service.validateSnapshotIntegrity(makeContextSnapshot({ sessionId: '' }))).toBe(false)
  })

  it('validateSnapshotIntegrity() rejects an empty capturedAt', () => {
    const service = createContextSnapshotService()
    expect(service.validateSnapshotIntegrity(makeContextSnapshot({ capturedAt: '' }))).toBe(false)
  })

  it('validateSnapshotIntegrity() rejects a snapshot with duplicate entry ids', () => {
    const service = createContextSnapshotService()
    const snapshot = makeContextSnapshot({
      entries: [makeContextEntry({ id: 'a' }), makeContextEntry({ id: 'a' })],
    })
    expect(service.validateSnapshotIntegrity(snapshot)).toBe(false)
  })
})
