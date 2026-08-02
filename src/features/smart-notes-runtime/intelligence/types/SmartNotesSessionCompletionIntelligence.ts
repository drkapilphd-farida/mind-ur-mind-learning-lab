import type { NoteTakingPaceRecommendation } from './NoteTakingPaceRecommendation'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. The real, deterministic
// bundle for the session-completion moment — engagement, a pacing
// recommendation, and a short list of honest, plain-language insights.
// No score, no grade, no note-content judgment — consistent with the
// platform's own Mastery Philosophy. Mirrors Memory Mode™'s own
// `SessionCompletionIntelligence` (Sprint-3) exactly.
export type SmartNotesSessionCompletionIntelligence = {
  engagementScore: number
  paceRecommendation: NoteTakingPaceRecommendation
  insights: readonly string[]
}
