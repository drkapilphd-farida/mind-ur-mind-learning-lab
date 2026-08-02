import { describe, expect, it } from 'vitest'
import { createAuditTrailRecorder } from './DefaultAuditTrailRecorder'
import { createEventDispatcher } from '../dispatcher'
import { createEventRepository } from '../repository'
import type { EventType } from '../domain'

describe('DefaultAuditTrailRecorder', () => {
  const cases: Array<{ method: keyof ReturnType<typeof createAuditTrailRecorder>; type: EventType }> = [
    { method: 'recordMemoryCreated', type: 'memory-created' },
    { method: 'recordMemoryUpdated', type: 'memory-updated' },
    { method: 'recordMemoryDeleted', type: 'memory-deleted' },
    { method: 'recordMemoryArchived', type: 'memory-archived' },
    { method: 'recordMemoryRestored', type: 'memory-restored' },
    { method: 'recordTransactionCommitted', type: 'transaction-committed' },
    { method: 'recordTransactionRolledBack', type: 'transaction-rolled-back' },
    { method: 'recordSessionContextChanged', type: 'session-context-changed' },
  ]

  for (const { method, type } of cases) {
    it(`${method}() records a "${type}" event with the given subject, user, and payload`, async () => {
      const repository = createEventRepository()
      const dispatcher = createEventDispatcher({ repository })
      const recorder = createAuditTrailRecorder('memory-persistence', dispatcher)

      const event = await (recorder[method] as (subjectId: string, userId: string, payload?: Record<string, unknown>) => Promise<unknown>)(
        'subject-1',
        'learner-1',
        { extra: true },
      )

      expect(event).toMatchObject({
        type,
        source: 'memory-persistence',
        state: 'recorded',
        metadata: { subjectId: 'subject-1', userId: 'learner-1', tags: [] },
        payload: { extra: true },
      })
    })
  }

  it('defaults payload to an empty object when not given', async () => {
    const recorder = createAuditTrailRecorder('memory-persistence')
    const event = await recorder.recordMemoryCreated('subject-1', 'learner-1')
    expect(event.payload).toEqual({})
  })

  it('fixes the source per recorder instance across every recorded event', async () => {
    const repository = createEventRepository()
    const dispatcher = createEventDispatcher({ repository })
    const recorder = createAuditTrailRecorder('memory-session-context', dispatcher)

    const event = await recorder.recordSessionContextChanged('session-1', 'learner-1')
    expect(event.source).toBe('memory-session-context')
  })
})
