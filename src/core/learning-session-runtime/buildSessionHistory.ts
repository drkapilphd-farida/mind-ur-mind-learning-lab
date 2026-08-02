import type { SessionSnapshot } from './types/SessionSnapshot'
import type { SessionHistory, SessionHistoryEntry } from './types/SessionHistory'

// Learning Session Runtime™ (LSE-3). Session History. Pure. The ONE shared
// implementation — real, derived entirely from a real list of already-
// persisted `SessionSnapshot`s (fetched by a concrete
// `SessionPersistenceAdapter.listByLearner`, never re-derived from a second
// source).
export function buildSessionHistory(snapshots: readonly SessionSnapshot[]): SessionHistory {
  const entries: SessionHistoryEntry[] = snapshots.map((snapshot) => ({
    sessionId: snapshot.sessionId,
    uloId: snapshot.uloId,
    sessionType: snapshot.sessionType,
    status: snapshot.status,
    completionPercentage: snapshot.completionPercentage,
    startedAt: snapshot.startedAt,
    completedAt: snapshot.completedAt,
  }))

  return {
    entries,
    totalSessions: snapshots.length,
    completedSessions: snapshots.filter((snapshot) => snapshot.status === 'completed').length,
  }
}
