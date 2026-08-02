import type { SmartNotesLearningProfile } from '../intelligence'
import type { SmartNotesConsistencyMetrics } from './types/SmartNotesConsistencyMetrics'
import type { SmartNotesSessionComparison } from './types/SmartNotesSessionComparison'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Improvement Insights.
// Pure — real, plain-language sentences built from Sprint-3's own
// `SmartNotesLearningProfile` plus this sprint's own consistency metrics
// and session comparison. A distinct function from Sprint-3's own
// `computeSmartNotesInsights` (locked, unmodified) — this one layers in
// real cross-session comparison and streak data Sprint-3 never computed.
// Mirrors Memory Mode™'s own `computeMemoryImprovementInsights`
// (Sprint-4) exactly.
const ENGAGEMENT_DELTA_THRESHOLD = 0.05

export function computeSmartNotesImprovementInsights(profile: SmartNotesLearningProfile, consistency: SmartNotesConsistencyMetrics, comparison: SmartNotesSessionComparison | null): readonly string[] {
  if (profile.sessionsCompleted === 0) {
    return ['Complete your first smart notes session to start seeing improvement insights.']
  }

  const insights: string[] = []

  if (consistency.currentStreakDays >= 2) {
    insights.push(`You're on a ${consistency.currentStreakDays}-day streak.`)
  }

  if (comparison !== null) {
    if (comparison.engagementScoreDelta > ENGAGEMENT_DELTA_THRESHOLD) {
      insights.push('Your most recent session showed higher engagement than the one before it.')
    } else if (comparison.engagementScoreDelta < -ENGAGEMENT_DELTA_THRESHOLD) {
      insights.push('Your most recent session showed lower engagement than the one before it — a slower pace next time may help.')
    }
  }

  if (profile.trend === 'improving') insights.push('Engagement has been trending up across your recent sessions.')
  else if (profile.trend === 'declining') insights.push('Engagement has dipped recently — revisiting earlier concepts may help.')

  if (insights.length === 0) insights.push('Keep going — more sessions will surface clearer patterns.')

  return insights
}
