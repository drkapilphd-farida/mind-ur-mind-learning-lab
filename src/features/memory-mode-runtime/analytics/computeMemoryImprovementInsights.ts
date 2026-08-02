import type { MemoryLearningProfile } from '../intelligence'
import type { MemoryConsistencyMetrics } from './types/MemoryConsistencyMetrics'
import type { MemorySessionComparison } from './types/MemorySessionComparison'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory
// Improvement Insights (item 7). Pure — real, plain-language sentences
// built from Sprint-3's own `MemoryLearningProfile` plus this sprint's
// own consistency metrics and session comparison. A distinct function
// from Sprint-3's own `computeMemoryPerformanceInsights` (locked,
// unmodified) — this one layers in real cross-session comparison and
// streak data Sprint-3 never computed, rather than editing Sprint-3's
// own file. Vocabulary follows the platform's Mastery Philosophy — no
// quiz/test/score/grade language.
const CONFIDENCE_DELTA_THRESHOLD = 0.05

export function computeMemoryImprovementInsights(profile: MemoryLearningProfile, consistency: MemoryConsistencyMetrics, comparison: MemorySessionComparison | null): readonly string[] {
  if (profile.sessionsCompleted === 0) {
    return ['Complete your first memory session to start seeing improvement insights.']
  }

  const insights: string[] = []

  if (consistency.currentStreakDays >= 2) {
    insights.push(`You're on a ${consistency.currentStreakDays}-day streak.`)
  }

  if (comparison !== null) {
    if (comparison.confidenceScoreDelta > CONFIDENCE_DELTA_THRESHOLD) {
      insights.push('Your most recent session showed higher confidence than the one before it.')
    } else if (comparison.confidenceScoreDelta < -CONFIDENCE_DELTA_THRESHOLD) {
      insights.push('Your most recent session showed lower confidence than the one before it — a slower pace next time may help.')
    }
  }

  if (profile.trend === 'improving') insights.push('Confidence has been trending up across your recent sessions.')
  else if (profile.trend === 'declining') insights.push('Confidence has dipped recently — revisiting earlier concepts may help.')

  if (insights.length === 0) insights.push('Keep going — more sessions will surface clearer patterns.')

  return insights
}
