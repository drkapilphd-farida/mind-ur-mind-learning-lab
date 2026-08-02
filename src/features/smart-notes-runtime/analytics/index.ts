// Smart Notes™ Sprint-4 — Analytics & Insights™. Every function here is
// pure and framework-agnostic, built on top of Sprint-3's own
// `intelligence/` (imported, never duplicated) and real, already-
// persisted `SessionSnapshot` data. No new AI pipeline, no new
// persistence, no new database query shape beyond what Sprint-1's
// `SessionPersistenceAdapter.listByLearner` already provides.
export type { SmartNotesSessionAnalytics, SmartNotesEngagementLevel, SmartNotesEngagementDistribution, SmartNotesTimelinePoint, SmartNotesConsistencyMetrics, SmartNotesSessionComparison, SmartNotesSummaryCardUnit, SmartNotesSummaryCardData } from './types'

export { computeSmartNotesSessionAnalytics } from './computeSmartNotesSessionAnalytics'
export { computeSmartNotesEngagementLevel } from './computeSmartNotesEngagementLevel'
export { computeSmartNotesEngagementDistribution } from './computeSmartNotesEngagementDistribution'
export { computeSmartNotesPerformanceTimeline } from './computeSmartNotesPerformanceTimeline'
export { computeSmartNotesConsistencyMetrics } from './computeSmartNotesConsistencyMetrics'
export { compareSmartNotesSessions } from './compareSmartNotesSessions'
export { computeSmartNotesImprovementInsights } from './computeSmartNotesImprovementInsights'
export { buildSmartNotesSummaryCards } from './buildSmartNotesSummaryCards'
