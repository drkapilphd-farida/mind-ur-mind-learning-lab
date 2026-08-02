import type { MemorySessionAnalytics } from './types/MemorySessionAnalytics'
import type { MemoryTimelinePoint } from './types/MemoryTimelinePoint'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory
// Performance Timeline (item 3). Pure — real per-session analytics,
// chronologically ordered by real `capturedAt`. No interpolation, no
// smoothing, no invented point between real sessions.
export function computeMemoryPerformanceTimeline(analytics: readonly MemorySessionAnalytics[]): readonly MemoryTimelinePoint[] {
  return [...analytics]
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .map((entry) => ({ sessionId: entry.sessionId, capturedAt: entry.capturedAt, confidenceScore: entry.confidenceScore, completionRate: entry.tracking.completionRate }))
}
