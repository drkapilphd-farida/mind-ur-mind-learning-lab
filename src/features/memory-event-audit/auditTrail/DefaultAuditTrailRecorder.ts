import type { EventSource, EventType, MemoryEvent } from '../domain'
import type { EventDispatcher } from '../dispatcher'
import { createEventDispatcher } from '../dispatcher'
import type { AuditTrailRecorder } from './AuditTrailRecorder'

export type AuditTrailRecorderDependencies = {
  dispatcher: EventDispatcher
  source: EventSource
}

// Implements AuditTrailRecorder. `source` is fixed per instance — in
// practice, each calling subsystem constructs its own recorder once
// (e.g. `createAuditTrailRecorder('memory-persistence')`), so every
// call site only ever needs to supply what actually varies per event
// (`subjectId`, `userId`, `payload`).
export class DefaultAuditTrailRecorder implements AuditTrailRecorder {
  constructor(private readonly dependencies: AuditTrailRecorderDependencies) {}

  recordMemoryCreated(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('memory-created', subjectId, userId, payload)
  }

  recordMemoryUpdated(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('memory-updated', subjectId, userId, payload)
  }

  recordMemoryDeleted(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('memory-deleted', subjectId, userId, payload)
  }

  recordMemoryArchived(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('memory-archived', subjectId, userId, payload)
  }

  recordMemoryRestored(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('memory-restored', subjectId, userId, payload)
  }

  recordTransactionCommitted(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('transaction-committed', subjectId, userId, payload)
  }

  recordTransactionRolledBack(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('transaction-rolled-back', subjectId, userId, payload)
  }

  recordSessionContextChanged(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent> {
    return this.record('session-context-changed', subjectId, userId, payload)
  }

  private record(
    type: EventType,
    subjectId: string,
    userId: string,
    payload: Readonly<Record<string, unknown>> = {},
  ): Promise<MemoryEvent> {
    return this.dependencies.dispatcher.registerEvent(type, this.dependencies.source, { subjectId, userId, tags: [] }, payload)
  }
}

export function createAuditTrailRecorder(source: EventSource, dispatcher: EventDispatcher = createEventDispatcher()): AuditTrailRecorder {
  return new DefaultAuditTrailRecorder({ source, dispatcher })
}
