import { describe, expect, it } from 'vitest'
import { createIndexMaintenanceService } from './DefaultIndexMaintenanceService'
import { makeFixedClock, makeMemory } from '../testFixtures'

describe('DefaultIndexMaintenanceService', () => {
  it('buildIndex() delegates to buildMemoryIndex using the injected clock', () => {
    const service = createIndexMaintenanceService({ clock: makeFixedClock('2026-05-01T00:00:00.000Z') })
    const index = service.buildIndex('type', [makeMemory({ id: 'a', type: 'exercise' })])
    expect(index.metadata).toEqual({ indexType: 'type', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' })
    expect(index.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
  })

  it('updateIndex() delegates to updateMemoryIndex using the injected clock', () => {
    const service = createIndexMaintenanceService({ clock: makeFixedClock('2026-05-02T00:00:00.000Z') })
    const built = service.buildIndex('type', [])
    const updated = service.updateIndex(built, makeMemory({ id: 'a', type: 'exercise' }))
    expect(updated.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
    expect(updated.metadata.updatedAt).toBe('2026-05-02T00:00:00.000Z')
  })

  it('removeIndexEntries() delegates to removeMemoryFromIndex using the injected clock', () => {
    const service = createIndexMaintenanceService({ clock: makeFixedClock('2026-05-03T00:00:00.000Z') })
    const built = service.buildIndex('type', [makeMemory({ id: 'a', type: 'exercise' })])
    const updated = service.removeIndexEntries(built, 'a')
    expect(updated.entries).toEqual([])
    expect(updated.metadata.updatedAt).toBe('2026-05-03T00:00:00.000Z')
  })

  it('rebuildIndex() delegates to rebuildMemoryIndex using the injected clock', () => {
    const service = createIndexMaintenanceService({ clock: makeFixedClock('2026-05-04T00:00:00.000Z') })
    const index = service.rebuildIndex('type', [makeMemory({ id: 'a', type: 'exercise' })])
    expect(index.metadata.createdAt).toBe('2026-05-04T00:00:00.000Z')
  })

  it('validateIndexConsistency() delegates to the shared validation function', () => {
    const service = createIndexMaintenanceService()
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    const index = service.buildIndex('type', [memory])
    expect(service.validateIndexConsistency(index, [memory])).toEqual({ valid: true, issues: [] })
  })

  it('validateIndexConsistency() reports issues for an inconsistent index', () => {
    const service = createIndexMaintenanceService()
    const index = service.buildIndex('type', [makeMemory({ id: 'a', type: 'exercise' })])
    const result = service.validateIndexConsistency(index, [])
    expect(result.valid).toBe(false)
  })
})
