// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Every function here is
// pure and framework-agnostic — no Supabase import, no `next/headers`,
// no reading of note *content* — operating only on real, already-
// persisted `SessionSnapshot`/`RuntimeMetrics` data (LSE-3, the Shared
// Learning Runtime) and a real, already-computed count of documents with
// saved notes. No new AI pipeline, no new persistence, no automatic
// change to LSE-2's own runtime behavior.
export type { SmartNotesSessionTracking, SmartNotesLearningProfile, SmartNotesLearningProfileTrend, NoteTakingPaceLevel, NoteTakingPaceRecommendation, SmartNotesContinueAction, SmartNotesContinueRecommendation, SmartNotesSessionCompletionIntelligence } from './types'

export { computeSmartNotesSessionTracking } from './computeSmartNotesSessionTracking'
export { computeSmartNotesEngagementScore } from './computeSmartNotesEngagementScore'
export { computeSmartNotesLearningProfile } from './computeSmartNotesLearningProfile'
export { recommendNoteTakingPace } from './recommendNoteTakingPace'
export { recommendSmartNotesContinueStrategy } from './recommendSmartNotesContinueStrategy'
export { computeSmartNotesInsights } from './computeSmartNotesInsights'
export { computeSmartNotesSessionCompletionIntelligence } from './computeSmartNotesSessionCompletionIntelligence'
