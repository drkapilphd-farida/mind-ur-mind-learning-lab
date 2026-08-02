import type { SessionStatus } from '@/core/learning-session-engine'
import type { MemorySessionTracking } from '../../intelligence'
import type { MemoryStrengthLevel } from './MemoryStrengthLevel'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. The real,
// per-session analytics record — real `SessionSnapshot` fields plus
// Sprint-3's own already-computed tracking/confidence signals (reused,
// never re-derived with different logic), plus this sprint's own
// strength classification. One real record per real session; no new
// per-session persistence.
export type MemorySessionAnalytics = {
  sessionId: string
  documentId: string
  status: SessionStatus
  startedAt: string | null
  completedAt: string | null
  capturedAt: string
  tracking: MemorySessionTracking
  confidenceScore: number
  strengthLevel: MemoryStrengthLevel
}
