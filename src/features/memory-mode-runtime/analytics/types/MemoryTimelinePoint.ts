// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. One real, ordered
// point per session for the Memory Performance Timeline — real
// `capturedAt`, real confidence, real completion, chronologically
// sorted. No interpolation, no smoothing, no invented data point.
export type MemoryTimelinePoint = {
  sessionId: string
  capturedAt: string
  confidenceScore: number
  completionRate: number
}
