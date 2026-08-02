import type { MemoryEvent } from '../domain'

// "Record immutable audit entries for: Memory creation, Memory update,
// Memory deletion, Archive/restore, Transaction commit, Transaction
// rollback, Session context changes. Audit entries must never modify
// business state." Every method here is a thin, named convenience over
// `EventDispatcher.registerEvent()` with a fixed `EventType` — this
// recorder never reads or writes anything except this feature's own
// `EventRepository`, so "never modify business state" holds
// structurally: it has no access to any other feature's repository to
// modify in the first place ("No cross-feature imports").
export interface AuditTrailRecorder {
  recordMemoryCreated(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordMemoryUpdated(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordMemoryDeleted(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordMemoryArchived(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordMemoryRestored(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordTransactionCommitted(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordTransactionRolledBack(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
  recordSessionContextChanged(subjectId: string, userId: string, payload?: Readonly<Record<string, unknown>>): Promise<MemoryEvent>
}
