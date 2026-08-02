import type { SmartNotesSessionAnalytics } from './types/SmartNotesSessionAnalytics'
import type { SmartNotesTimelinePoint } from './types/SmartNotesTimelinePoint'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Performance Timeline.
// Pure — real per-session analytics, chronologically ordered by real
// `capturedAt`. No interpolation, no smoothing, no invented point.
// Mirrors Memory Mode™'s own `computeMemoryPerformanceTimeline`
// (Sprint-4) exactly.
export function computeSmartNotesPerformanceTimeline(analytics: readonly SmartNotesSessionAnalytics[]): readonly SmartNotesTimelinePoint[] {
  return [...analytics]
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .map((entry) => ({ sessionId: entry.sessionId, capturedAt: entry.capturedAt, engagementScore: entry.engagementScore, completionRate: entry.tracking.completionRate }))
}
