import { describe, expect, it } from 'vitest'
import { createContextOrchestrationService } from './DefaultContextOrchestrationService'
import type { ContextOrchestrationService } from './ContextOrchestrationService'
import { createSessionContextRepository, SessionContextNotFoundError } from '../repository'
import type { SessionContextRepository } from '../contracts'
import { IllegalSessionContextLifecycleTransitionError } from '../lifecycle'
import { InvalidContextSnapshotError } from '../snapshot'
import { makeContextEntry, makeContextSnapshot, makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

function buildService(
  overrides: { maxEntries?: number | null; maxPayloadSize?: number | null } = {},
): { service: ContextOrchestrationService; repository: SessionContextRepository } {
  const clock = makeFixedClock('2026-01-01T00:00:00.000Z')
  const idGenerator = makeSequentialIdGenerator('session')
  const repository = createSessionContextRepository(clock)

  const service = createContextOrchestrationService({
    repository,
    clock,
    idGenerator,
    windowLimits: { maxEntries: overrides.maxEntries ?? null, maxPayloadSize: overrides.maxPayloadSize ?? null },
  })

  return { service, repository }
}

describe('DefaultContextOrchestrationService', () => {
  it('initializeSession() creates a session already in the active lifecycle state', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })

    expect(context.id).toBe('session-1')
    expect(context.lifecycle).toBe('active')
    expect(context.entries).toEqual([])
    expect(context.metadata).toEqual({ ownerId: 'learner-1', source: 'conversation', tags: [] })
    expect(context.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('initializeSession() persists the session so it can be loaded back through the repository', async () => {
    const { service, repository } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })
    expect(await repository.load(context.id)).toEqual(context)
  })

  it('updateContext() merges incoming entries onto an existing session, preventing duplicates', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })

    const first = await service.updateContext(context.id, [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })])
    expect(first.entries.map((e) => e.id)).toEqual(['a'])

    const second = await service.updateContext(context.id, [
      makeContextEntry({ id: 'a-again', memoryReferenceId: 'mem-a' }),
      makeContextEntry({ id: 'b', memoryReferenceId: 'mem-b' }),
    ])
    expect(second.entries.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('updateContext() applies the configured window limits after merging', async () => {
    const { service } = buildService({ maxEntries: 1 })
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })
    await service.updateContext(context.id, [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })])
    const updated = await service.updateContext(context.id, [makeContextEntry({ id: 'b', memoryReferenceId: 'mem-b' })])
    expect(updated.entries.map((e) => e.id)).toEqual(['b'])
  })

  it('updateContext() throws SessionContextNotFoundError for an unknown session', async () => {
    const { service } = buildService()
    await expect(service.updateContext('does-not-exist', [])).rejects.toThrow(SessionContextNotFoundError)
  })

  it('suspendSession() then resumeSession() round-trips through the lifecycle', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })

    const suspended = await service.suspendSession(context.id)
    expect(suspended.lifecycle).toBe('suspended')

    const resumed = await service.resumeSession(context.id)
    expect(resumed.lifecycle).toBe('active')
  })

  it('closeSession() moves the session to closed via the repository archive() capability', async () => {
    const { service, repository } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })

    const closed = await service.closeSession(context.id)
    expect(closed.lifecycle).toBe('closed')
    expect((await repository.load(context.id))?.lifecycle).toBe('closed')
  })

  it('closeSession() rejects an already-closed session (illegal transition, business rule enforced before persistence)', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })
    await service.closeSession(context.id)
    await expect(service.closeSession(context.id)).rejects.toThrow(IllegalSessionContextLifecycleTransitionError)
  })

  it('createSnapshot() captures the session\'s current entries', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })
    await service.updateContext(context.id, [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })])

    const snapshot = await service.createSnapshot(context.id)
    expect(snapshot.sessionId).toBe(context.id)
    expect(snapshot.entries.map((e) => e.id)).toEqual(['a'])
  })

  it('createSnapshot() throws SessionContextNotFoundError for an unknown session', async () => {
    const { service } = buildService()
    await expect(service.createSnapshot('does-not-exist')).rejects.toThrow(SessionContextNotFoundError)
  })

  it('restoreFromSnapshot() replaces the session\'s entries with the snapshot\'s entries', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })
    await service.updateContext(context.id, [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })])
    const snapshot = await service.createSnapshot(context.id)

    await service.updateContext(context.id, [makeContextEntry({ id: 'b', memoryReferenceId: 'mem-b' })])
    const restored = await service.restoreFromSnapshot(context.id, snapshot)
    expect(restored.entries.map((e) => e.id)).toEqual(['a'])
  })

  it('restoreFromSnapshot() throws InvalidContextSnapshotError for a corrupt snapshot', async () => {
    const { service } = buildService()
    const context = await service.initializeSession({ ownerId: 'learner-1', source: 'conversation' })
    const corrupt = makeContextSnapshot({ id: '' })
    await expect(service.restoreFromSnapshot(context.id, corrupt)).rejects.toThrow(InvalidContextSnapshotError)
  })

  it('restoreFromSnapshot() throws SessionContextNotFoundError for an unknown session', async () => {
    const { service } = buildService()
    await expect(service.restoreFromSnapshot('does-not-exist', makeContextSnapshot())).rejects.toThrow(SessionContextNotFoundError)
  })
})
