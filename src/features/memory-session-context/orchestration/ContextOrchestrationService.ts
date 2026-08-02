import type { ContextEntry, ContextSnapshot, SessionContext, SessionId } from '../domain'

export type InitializeSessionInput = {
  ownerId: string
  source: string
  tags?: readonly string[]
}

// "Session initialization, Context updates, Snapshot coordination,
// Lifecycle management. Business rules remain outside repository
// implementations" — every lifecycle-legality check and every
// merge/window/snapshot-integrity decision happens here, never inside
// SessionContextRepository.
export interface ContextOrchestrationService {
  initializeSession(input: InitializeSessionInput): Promise<SessionContext>
  updateContext(sessionId: SessionId, incomingEntries: readonly ContextEntry[]): Promise<SessionContext>
  suspendSession(sessionId: SessionId): Promise<SessionContext>
  resumeSession(sessionId: SessionId): Promise<SessionContext>
  closeSession(sessionId: SessionId): Promise<SessionContext>
  createSnapshot(sessionId: SessionId): Promise<ContextSnapshot>
  restoreFromSnapshot(sessionId: SessionId, snapshot: ContextSnapshot): Promise<SessionContext>
}
