import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeSmartNotesSessionTracking, computeSmartNotesEngagementScore } from '../intelligence'
import { computeSmartNotesEngagementLevel } from './computeSmartNotesEngagementLevel'
import type { SmartNotesSessionAnalytics } from './types/SmartNotesSessionAnalytics'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Session Analytics. Pure.
// The one real per-session record every other analytics function in
// this sprint builds from — reuses Sprint-3's own
// `computeSmartNotesSessionTracking`/`computeSmartNotesEngagementScore`
// verbatim rather than re-deriving either. Mirrors Memory Mode™'s own
// `computeMemorySessionAnalytics` (Sprint-4) exactly.
export function computeSmartNotesSessionAnalytics(snapshot: SessionSnapshot): SmartNotesSessionAnalytics {
  const tracking = computeSmartNotesSessionTracking(snapshot)
  const engagementScore = computeSmartNotesEngagementScore(tracking)

  return {
    sessionId: snapshot.sessionId,
    documentId: snapshot.documentId,
    status: snapshot.status,
    startedAt: snapshot.startedAt,
    completedAt: snapshot.completedAt,
    capturedAt: snapshot.capturedAt,
    tracking,
    engagementScore,
    engagementLevel: computeSmartNotesEngagementLevel(engagementScore),
  }
}
