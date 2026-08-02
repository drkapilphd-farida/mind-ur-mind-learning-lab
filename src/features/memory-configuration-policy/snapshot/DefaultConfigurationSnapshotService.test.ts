import { describe, expect, it } from 'vitest'
import { createConfigurationSnapshotService } from './DefaultConfigurationSnapshotService'
import { makeConfigurationSnapshot, makeFixedClock, makeMemoryConfiguration, makeSequentialIdGenerator } from '../testFixtures'

describe('DefaultConfigurationSnapshotService', () => {
  it('createSnapshot() starts a new chain at version 1 when no previous snapshot is given', () => {
    const service = createConfigurationSnapshotService({
      clock: makeFixedClock('2026-02-01T00:00:00.000Z'),
      idGenerator: makeSequentialIdGenerator('snapshot'),
    })
    const configuration = makeMemoryConfiguration()
    const snapshot = service.createSnapshot(configuration, null)

    expect(snapshot).toEqual({ id: 'snapshot-1', configuration, version: 1, capturedAt: '2026-02-01T00:00:00.000Z' })
  })

  it('createSnapshot() increments the version when a previous snapshot is given', () => {
    const service = createConfigurationSnapshotService()
    const previous = makeConfigurationSnapshot({ version: 3 })
    const snapshot = service.createSnapshot(makeMemoryConfiguration(), previous)
    expect(snapshot.version).toBe(4)
  })

  it('restoreSnapshot() returns the snapshot\'s configuration as a new array reference', () => {
    const service = createConfigurationSnapshotService()
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] })
    const snapshot = makeConfigurationSnapshot({ configuration })

    const restored = service.restoreSnapshot(snapshot)
    expect(restored).toEqual(configuration)
    expect(restored.entries).not.toBe(configuration.entries)
  })

  it('compareSnapshots() reports added, removed, changed, and unchanged entries', () => {
    const service = createConfigurationSnapshotService()
    const base = makeConfigurationSnapshot({
      configuration: makeMemoryConfiguration({
        entries: [
          { key: 'kept', value: 1 },
          { key: 'changed', value: 'before' },
          { key: 'removed', value: true },
        ],
      }),
    })
    const next = makeConfigurationSnapshot({
      configuration: makeMemoryConfiguration({
        entries: [
          { key: 'kept', value: 1 },
          { key: 'changed', value: 'after' },
          { key: 'added', value: 2 },
        ],
      }),
    })

    const comparison = service.compareSnapshots(base, next)
    expect(comparison.added).toEqual([{ key: 'added', value: 2 }])
    expect(comparison.removed).toEqual([{ key: 'removed', value: true }])
    expect(comparison.changed).toEqual([{ key: 'changed', before: 'before', after: 'after' }])
    expect(comparison.unchanged).toEqual([{ key: 'kept', value: 1 }])
  })

  it('compareSnapshots() reports no differences for two identical snapshots', () => {
    const service = createConfigurationSnapshotService()
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] })
    const snapshot = makeConfigurationSnapshot({ configuration })

    const comparison = service.compareSnapshots(snapshot, snapshot)
    expect(comparison.added).toEqual([])
    expect(comparison.removed).toEqual([])
    expect(comparison.changed).toEqual([])
    expect(comparison.unchanged).toEqual([{ key: 'a', value: 1 }])
  })
})
