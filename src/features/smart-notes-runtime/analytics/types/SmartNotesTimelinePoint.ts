// Smart Notes™ Sprint-4 — Analytics & Insights™. One real, ordered point
// per session for the Smart Notes Performance Timeline — real
// `capturedAt`, real engagement, real completion, chronologically
// sorted. No interpolation, no smoothing, no invented data point.
// Mirrors Memory Mode™'s own `MemoryTimelinePoint` (Sprint-4) exactly.
export type SmartNotesTimelinePoint = {
  sessionId: string
  capturedAt: string
  engagementScore: number
  completionRate: number
}
