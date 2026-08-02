import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeSmartNotesSessionTracking } from './computeSmartNotesSessionTracking'
import { computeSmartNotesEngagementScore } from './computeSmartNotesEngagementScore'
import { recommendNoteTakingPace } from './recommendNoteTakingPace'
import { computeSmartNotesLearningProfile } from './computeSmartNotesLearningProfile'
import { computeSmartNotesInsights } from './computeSmartNotesInsights'
import type { SmartNotesSessionCompletionIntelligence } from './types/SmartNotesSessionCompletionIntelligence'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Pure. The real,
// composed bundle for the session-completion moment — engagement, a
// pacing recommendation for the learner's next session, and honest
// plain-language insights, all derived from this sprint's own lower
// functions over already-real data. Mirrors Memory Mode™'s own
// `computeSessionCompletionIntelligence` (Sprint-3) exactly.
// `historicalSnapshots` should include `snapshot` itself; `documentsWithNotes`
// is passed in already-computed, keeping this function framework-agnostic.
export function computeSmartNotesSessionCompletionIntelligence(snapshot: SessionSnapshot, historicalSnapshots: readonly SessionSnapshot[], documentsWithNotes: number): SmartNotesSessionCompletionIntelligence {
  const tracking = computeSmartNotesSessionTracking(snapshot)
  const engagementScore = computeSmartNotesEngagementScore(tracking)
  const paceRecommendation = recommendNoteTakingPace(tracking)
  const profile = computeSmartNotesLearningProfile(historicalSnapshots, documentsWithNotes)
  const insights = computeSmartNotesInsights(profile)

  return { engagementScore, paceRecommendation, insights }
}
