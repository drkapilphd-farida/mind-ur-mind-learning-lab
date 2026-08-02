import { describe, expect, it } from 'vitest'
import { createRollbackEngine } from './DefaultRollbackEngine'
import { createMemoryRepository } from '../repository'
import { makeMemory } from '../testFixtures'

describe('DefaultRollbackEngine', () => {
  describe('captureSnapshot', () => {
    it('captures the current value for a memory that already exists', async () => {
      const repository = createMemoryRepository()
      const memory = makeMemory({ id: 'a' })
      await repository.save(memory)

      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'update', memory }])
      expect(snapshot).toEqual([{ memoryId: 'a', before: memory }])
    })

    it('captures null for a memory that does not exist yet (about to be created)', async () => {
      const repository = createMemoryRepository()
      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'create', memory: makeMemory({ id: 'a' }) }])
      expect(snapshot).toEqual([{ memoryId: 'a', before: null }])
    })

    it('deduplicates operations targeting the same memory id into one record', async () => {
      const repository = createMemoryRepository()
      const memory = makeMemory({ id: 'a' })
      await repository.save(memory)

      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([
        { type: 'update', memory },
        { type: 'delete', memoryId: 'a' },
      ])
      expect(snapshot).toHaveLength(1)
    })
  })

  describe('restoreSnapshot', () => {
    it('restores a memory to its captured value', async () => {
      const repository = createMemoryRepository()
      const original = makeMemory({ id: 'a', pinned: false })
      await repository.save(original)

      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'update', memory: original }])

      await repository.update(makeMemory({ id: 'a', pinned: true }))
      await engine.restoreSnapshot(snapshot)

      expect(await repository.load('a')).toEqual(original)
    })

    it('deletes a memory that did not exist before the transaction (undoing a create)', async () => {
      const repository = createMemoryRepository()
      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'create', memory: makeMemory({ id: 'a' }) }])

      await repository.save(makeMemory({ id: 'a' }))
      await engine.restoreSnapshot(snapshot)

      expect(await repository.load('a')).toBeNull()
    })

    it('is safe (no-op) restoring a before:null record for a memory that was never actually created', async () => {
      const repository = createMemoryRepository()
      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'create', memory: makeMemory({ id: 'a' }) }])

      await expect(engine.restoreSnapshot(snapshot)).resolves.not.toThrow()
      expect(await repository.load('a')).toBeNull()
    })
  })

  describe('validateRollbackIntegrity', () => {
    it('returns true when the repository matches the snapshot exactly', async () => {
      const repository = createMemoryRepository()
      const memory = makeMemory({ id: 'a' })
      await repository.save(memory)

      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'update', memory }])
      expect(await engine.validateRollbackIntegrity(snapshot)).toBe(true)
    })

    it('returns false when the repository no longer matches the snapshot', async () => {
      const repository = createMemoryRepository()
      const memory = makeMemory({ id: 'a', pinned: false })
      await repository.save(memory)

      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'update', memory }])

      await repository.update(makeMemory({ id: 'a', pinned: true }))
      expect(await engine.validateRollbackIntegrity(snapshot)).toBe(false)
    })

    it('returns true when a before:null record correctly has no current memory', async () => {
      const repository = createMemoryRepository()
      const engine = createRollbackEngine(repository)
      const snapshot = await engine.captureSnapshot([{ type: 'create', memory: makeMemory({ id: 'a' }) }])
      expect(await engine.validateRollbackIntegrity(snapshot)).toBe(true)
    })
  })
})
