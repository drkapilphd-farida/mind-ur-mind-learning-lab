import { describe, expect, it } from 'vitest'
import { buildTransactionAudit } from './buildTransactionAudit'
import { makeMemory, makeMemoryTransaction } from '../testFixtures'

describe('buildTransactionAudit', () => {
  it('assembles an audit from the transaction, validation result, and given timestamp', () => {
    const transaction = makeMemoryTransaction({
      id: 'transaction-1',
      state: 'committed',
      operations: [{ type: 'create', memory: makeMemory({ id: 'a' }) }],
    })
    const validationResult = { valid: true, issues: [] }

    const audit = buildTransactionAudit(transaction, validationResult, '2026-04-01T00:00:00.000Z')

    expect(audit).toEqual({
      transactionId: 'transaction-1',
      timestamp: '2026-04-01T00:00:00.000Z',
      operations: transaction.operations,
      finalState: 'committed',
      validationResult,
    })
  })

  it('reflects the transaction\'s final state, whatever it is', () => {
    const transaction = makeMemoryTransaction({ state: 'failed' })
    const audit = buildTransactionAudit(transaction, { valid: true, issues: [] }, '2026-04-01T00:00:00.000Z')
    expect(audit.finalState).toBe('failed')
  })

  it('carries the given validation result through unchanged, issues included', () => {
    const transaction = makeMemoryTransaction()
    const validationResult = { valid: false, issues: [{ type: 'duplicate-operation' as const, detail: 'x' }] }
    const audit = buildTransactionAudit(transaction, validationResult, '2026-04-01T00:00:00.000Z')
    expect(audit.validationResult).toEqual(validationResult)
  })
})
