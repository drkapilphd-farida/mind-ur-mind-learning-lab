import { describe, expect, it } from 'vitest'
import { createSessionContextRepository } from './InMemorySessionContextRepository'
import { SessionContextNotFoundError } from './SessionContextNotFoundError'
import { makeFixedClock, makeSessionContext } from '../testFixtures'

describe('InMemorySessionContextRepository', () => {
  it('save() then load() returns the same session context', async () => {
    const repository = createSessionContextRepository()
    const context = makeSessionContext()
    await repository.save(context)
    expect(await repository.load(context.id)).toEqual(context)
  })

  it('load() returns null for an unknown id', async () => {
    const repository = createSessionContextRepository()
    expect(await repository.load('does-not-exist')).toBeNull()
  })

  it('save() overwrites an existing entry with the same id', async () => {
    const repository = createSessionContextRepository()
    await repository.save(makeSessionContext({ lifecycle: 'created' }))
    await repository.save(makeSessionContext({ lifecycle: 'active' }))
    expect((await repository.load('session-1'))?.lifecycle).toBe('active')
  })

  it('archive() sets lifecycle to closed and bumps updatedAt via the injected clock', async () => {
    const repository = createSessionContextRepository(makeFixedClock('2026-03-01T00:00:00.000Z'))
    await repository.save(makeSessionContext({ lifecycle: 'active', updatedAt: '2026-01-01T00:00:00.000Z' }))
    const archived = await repository.archive('session-1')

    expect(archived.lifecycle).toBe('closed')
    expect(archived.updatedAt).toBe('2026-03-01T00:00:00.000Z')
    expect((await repository.load('session-1'))?.lifecycle).toBe('closed')
  })

  it('archive() throws SessionContextNotFoundError for an unsaved id', async () => {
    const repository = createSessionContextRepository()
    await expect(repository.archive('does-not-exist')).rejects.toThrow(SessionContextNotFoundError)
  })

  it('delete() removes the session context', async () => {
    const repository = createSessionContextRepository()
    await repository.save(makeSessionContext())
    await repository.delete('session-1')
    expect(await repository.load('session-1')).toBeNull()
  })

  it('delete() throws SessionContextNotFoundError for an unsaved id', async () => {
    const repository = createSessionContextRepository()
    await expect(repository.delete('does-not-exist')).rejects.toThrow(SessionContextNotFoundError)
  })
})
