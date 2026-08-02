import type { SessionStatus } from '@/core/learning-session-engine'
import type { SmartNotesSessionTracking } from '../../intelligence'
import type { SmartNotesEngagementLevel } from './SmartNotesEngagementLevel'

// Smart Notes™ Sprint-4 — Analytics & Insights™. The real, per-session
// analytics record — real `SessionSnapshot` fields plus Sprint-3's own
// already-computed tracking/engagement signals (reused, never
// re-derived with different logic), plus this sprint's own engagement
// classification. Mirrors Memory Mode™'s own `MemorySessionAnalytics`
// (Sprint-4) exactly, renamed for a note-taking context.
export type SmartNotesSessionAnalytics = {
  sessionId: string
  documentId: string
  status: SessionStatus
  startedAt: string | null
  completedAt: string | null
  capturedAt: string
  tracking: SmartNotesSessionTracking
  engagementScore: number
  engagementLevel: SmartNotesEngagementLevel
}
