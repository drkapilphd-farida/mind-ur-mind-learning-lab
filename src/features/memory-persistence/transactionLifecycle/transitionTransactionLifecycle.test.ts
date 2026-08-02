import { describe, expect, it } from 'vitest'
import {
  moveTransactionToCommitted,
  moveTransactionToFailed,
  moveTransactionToPending,
  moveTransactionToRolledBack,
  transitionTransactionLifecycle,
} from './transitionTransactionLifecycle'
import { IllegalTransactionStateTransitionError } from './IllegalTransactionStateTransitionError'
import { makeMemoryTransaction } from '../testFixtures'

describe('transitionTransactionLifecycle', () => {
  it('walks the happy path: created -> pending -> committed', () => {
    const created = makeMemoryTransaction({ state: 'created' })
    const pending = moveTransactionToPending(created, '2026-01-02T00:00:00.000Z')
    expect(pending.state).toBe('pending')
    expect(pending.updatedAt).toBe('2026-01-02T00:00:00.000Z')

    const committed = moveTransactionToCommitted(pending, '2026-01-03T00:00:00.000Z')
    expect(committed.state).toBe('committed')
  })

  it('walks the failure path: created -> pending -> failed -> rolledBack', () => {
    const created = makeMemoryTransaction({ state: 'created' })
    const pending = moveTransactionToPending(created, '2026-01-02T00:00:00.000Z')
    const failed = moveTransactionToFailed(pending, '2026-01-03T00:00:00.000Z')
    expect(failed.state).toBe('failed')

    const rolledBack = moveTransactionToRolledBack(failed, '2026-01-04T00:00:00.000Z')
    expect(rolledBack.state).toBe('rolledBack')
  })

  it('allows created -> rolledBack directly (cancel before commit)', () => {
    const created = makeMemoryTransaction({ state: 'created' })
    expect(moveTransactionToRolledBack(created, '2026-01-02T00:00:00.000Z').state).toBe('rolledBack')
  })

  it('allows pending -> rolledBack directly (cancel mid-flight)', () => {
    const pending = makeMemoryTransaction({ state: 'pending' })
    expect(moveTransactionToRolledBack(pending, '2026-01-02T00:00:00.000Z').state).toBe('rolledBack')
  })

  it('rejects created -> committed (must go through pending first)', () => {
    const created = makeMemoryTransaction({ state: 'created' })
    expect(() => transitionTransactionLifecycle(created, 'committed', '2026-01-02T00:00:00.000Z')).toThrow(
      IllegalTransactionStateTransitionError,
    )
  })

  it('rejects any transition out of committed (terminal)', () => {
    const committed = makeMemoryTransaction({ state: 'committed' })
    expect(() => moveTransactionToRolledBack(committed, '2026-01-02T00:00:00.000Z')).toThrow(IllegalTransactionStateTransitionError)
  })

  it('rejects any transition out of rolledBack (terminal)', () => {
    const rolledBack = makeMemoryTransaction({ state: 'rolledBack' })
    expect(() => moveTransactionToPending(rolledBack, '2026-01-02T00:00:00.000Z')).toThrow(IllegalTransactionStateTransitionError)
  })

  it('rejects failed -> committed (a failed transaction can only be rolled back)', () => {
    const failed = makeMemoryTransaction({ state: 'failed' })
    expect(() => moveTransactionToCommitted(failed, '2026-01-02T00:00:00.000Z')).toThrow(IllegalTransactionStateTransitionError)
  })

  it('never mutates the given transaction — returns a new object', () => {
    const created = makeMemoryTransaction({ state: 'created' })
    const pending = moveTransactionToPending(created, '2026-01-02T00:00:00.000Z')
    expect(created.state).toBe('created')
    expect(pending).not.toBe(created)
  })

  it('the error message names both the from and to states', () => {
    const committed = makeMemoryTransaction({ state: 'committed' })
    try {
      moveTransactionToPending(committed, '2026-01-02T00:00:00.000Z')
      throw new Error('expected transition to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalTransactionStateTransitionError)
      expect((error as Error).message).toContain('"committed" -> "pending"')
      expect((error as Error).name).toBe('IllegalTransactionStateTransitionError')
    }
  })
})
