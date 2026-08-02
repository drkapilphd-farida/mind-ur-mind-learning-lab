import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeMemorySessionTracking, computeMemoryConfidenceScore } from '../intelligence'
import { computeMemoryStrengthLevel } from './computeMemoryStrengthLevel'
import type { MemorySessionAnalytics } from './types/MemorySessionAnalytics'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory Session
// Analytics (item 1). Pure. The one real per-session record every other
// analytics function in this sprint builds from — reuses Sprint-3's own
// `computeMemorySessionTracking`/`computeMemoryConfidenceScore` verbatim
// rather than re-deriving either, so there is exactly one real
// implementation of "what a session's tracking/confidence is," never two.
export function computeMemorySessionAnalytics(snapshot: SessionSnapshot): MemorySessionAnalytics {
  const tracking = computeMemorySessionTracking(snapshot)
  const confidenceScore = computeMemoryConfidenceScore(tracking)

  return {
    sessionId: snapshot.sessionId,
    documentId: snapshot.documentId,
    status: snapshot.status,
    startedAt: snapshot.startedAt,
    completedAt: snapshot.completedAt,
    capturedAt: snapshot.capturedAt,
    tracking,
    confidenceScore,
    strengthLevel: computeMemoryStrengthLevel(confidenceScore),
  }
}
