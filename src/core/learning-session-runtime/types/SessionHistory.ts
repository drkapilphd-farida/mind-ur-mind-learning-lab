import type { SessionType } from '@/core/universal-learning-engine/universal-learning-object'
import type { SessionStatus } from '@/core/learning-session-engine'

// Learning Session Runtime™ (LSE-3). Session History — real, derived
// entirely from real, already-persisted `SessionSnapshot`s (see
// buildSessionHistory.ts). Every field here is a direct read of a real
// snapshot field, reused, never re-derived from a second source.
export type SessionHistoryEntry = {
  sessionId: string
  uloId: string
  sessionType: SessionType
  status: SessionStatus
  completionPercentage: number
  startedAt: string | null
  completedAt: string | null
}

export type SessionHistory = {
  entries: readonly SessionHistoryEntry[]
  totalSessions: number
  completedSessions: number
}
