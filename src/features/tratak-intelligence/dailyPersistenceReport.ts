// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 10F
// architecture refinement. Combines a day's 5 real, already-computed
// per-image Visual Intelligence Reports™ into ONE final summary — no
// report is shown after images 1-4, only this aggregate after image 5.
// Every number here is a plain average (or sum, for XP) of real per-image
// data already stored in analyzer_data — nothing fabricated, nothing
// recomputed differently from what each image's own report already said.

import type { VisualIntelligenceReport } from './actions/completeTratakMissionSession'
import { generateVisualIntelligenceRecommendation } from './imageFixation/visualIntelligenceRecommendation'

export type DailyImageSessionSummary = {
  report: VisualIntelligenceReport
  xpEarned: number
}

export type DailyPersistenceReport = {
  // Average of all 5 real VisualIntelligenceScores across all 5 images —
  // the true holistic composite for the day.
  todaysPersistenceScore: number
  // The brief's 3 named tiles — each averaged across the 5 images.
  observationAccuracy: number
  fixationStability: number
  visualRecall: number
  xpEarnedToday: number
  recommendation: string
}

function average(sessions: readonly DailyImageSessionSummary[], select: (report: VisualIntelligenceReport) => number): number {
  return Math.round(sessions.reduce((sum, session) => sum + select(session.report), 0) / sessions.length)
}

export function computeDailyPersistenceReport(todaysSessions: readonly DailyImageSessionSummary[]): DailyPersistenceReport | null {
  if (todaysSessions.length === 0) return null

  const observationAccuracy = average(todaysSessions, (report) => report.observationAccuracy)
  const fixationStability = average(todaysSessions, (report) => report.fixationStability)
  const visualRecall = average(todaysSessions, (report) => report.visualRecall)
  const afterImageAwareness = average(todaysSessions, (report) => report.afterImageAwareness)
  const attentionScore = average(todaysSessions, (report) => report.attentionScore)

  const todaysPersistenceScore = Math.round((observationAccuracy + fixationStability + visualRecall + afterImageAwareness + attentionScore) / 5)
  const xpEarnedToday = todaysSessions.reduce((sum, session) => sum + session.xpEarned, 0)

  const recommendation = generateVisualIntelligenceRecommendation(
    { observationAccuracy, fixationStability, visualRecall, afterImageAwareness, attentionScore },
    null,
    "Today's Challenge Complete — come back tomorrow for a fresh set of images.",
  )

  return { todaysPersistenceScore, observationAccuracy, fixationStability, visualRecall, xpEarnedToday, recommendation }
}
