import { describe, expect, it } from 'vitest'
import { validateTransaction } from './validateTransaction'
import { createMemoryRepository } from '../repository'
import { makeMemory, makeMemoryTransaction } from '../testFixtures'

describe('validateTransaction', () => {
  it('reports valid: true for a well-formed transaction with no operations', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ state: 'created', operations: [] })
    expect(await validateTransaction(transaction, repository)).toEqual({ valid: true, issues: [] })
  })

  it('reports valid: true for a well-formed transaction whose referenced memories exist', async () => {
    const repository = createMemoryRepository()
    const memory = makeMemory({ id: 'a' })
    await repository.save(memory)

    const transaction = makeMemoryTransaction({
      state: 'created',
      operations: [
        { type: 'create', memory: makeMemory({ id: 'b' }) },
        { type: 'update', memory: { ...memory, pinned: true } },
      ],
    })
    expect(await validateTransaction(transaction, repository)).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-state-transition for an already-terminal transaction', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ state: 'committed' })
    const result = await validateTransaction(transaction, repository)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'invalid-state-transition')).toBe(true)
  })

  it('does not flag invalid-state-transition for a pending transaction', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ state: 'pending', operations: [] })
    const result = await validateTransaction(transaction, repository)
    expect(result.issues.some((issue) => issue.type === 'invalid-state-transition')).toBe(false)
  })

  it('detects duplicate-operation when the same (type, target id) pair appears twice', async () => {
    const repository = createMemoryRepository()
    const memory = makeMemory({ id: 'a' })
    await repository.save(memory)

    const transaction = makeMemoryTransaction({
      operations: [
        { type: 'update', memory },
        { type: 'update', memory },
      ],
    })
    const result = await validateTransaction(transaction, repository)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-operation')).toBe(true)
  })

  it('detects missing-memory-reference for an update targeting a nonexistent memory', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ operations: [{ type: 'update', memory: makeMemory({ id: 'ghost' }) }] })
    const result = await validateTransaction(transaction, repository)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-memory-reference')).toBe(true)
  })

  it('detects missing-memory-reference for an archive targeting a nonexistent memory', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ operations: [{ type: 'archive', memoryId: 'ghost' }] })
    const result = await validateTransaction(transaction, repository)
    expect(result.issues.some((issue) => issue.type === 'missing-memory-reference')).toBe(true)
  })

  it('detects missing-memory-reference for a delete targeting a nonexistent memory', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ operations: [{ type: 'delete', memoryId: 'ghost' }] })
    const result = await validateTransaction(transaction, repository)
    expect(result.issues.some((issue) => issue.type === 'missing-memory-reference')).toBe(true)
  })

  it('does not require a create operation to reference an existing memory', async () => {
    const repository = createMemoryRepository()
    const transaction = makeMemoryTransaction({ operations: [{ type: 'create', memory: makeMemory({ id: 'new' }) }] })
    const result = await validateTransaction(transaction, repository)
    expect(result.issues.some((issue) => issue.type === 'missing-memory-reference')).toBe(false)
  })

  it('detects a concurrent-conflict when two distinct operation types target the same memory id', async () => {
    const repository = createMemoryRepository()
    const memory = makeMemory({ id: 'a' })
    await repository.save(memory)

    const transaction = makeMemoryTransaction({
      operations: [
        { type: 'update', memory },
        { type: 'delete', memoryId: 'a' },
      ],
    })
    const result = await validateTransaction(transaction, repository)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'concurrent-conflict')).toBe(true)
  })

  it('does not flag a concurrent-conflict for operations on different memory ids', async () => {
    const repository = createMemoryRepository()
    await repository.save(makeMemory({ id: 'a' }))
    await repository.save(makeMemory({ id: 'b' }))

    const transaction = makeMemoryTransaction({
      operations: [
        { type: 'update', memory: makeMemory({ id: 'a' }) },
        { type: 'delete', memoryId: 'b' },
      ],
    })
    const result = await validateTransaction(transaction, repository)
    expect(result.issues.some((issue) => issue.type === 'concurrent-conflict')).toBe(false)
  })
})
