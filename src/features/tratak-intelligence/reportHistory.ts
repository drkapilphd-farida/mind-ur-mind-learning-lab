import type { TratakMissionSessionRecord } from './tratakTypes'
import type { VisualIntelligenceReport } from './actions/completeTratakMissionSession'

export type ReportHistoryEntry = {
  occurredAt: string
  levelNumber: number
  report: VisualIntelligenceReport
}

export type ReportHistory = {
  latestSession: ReportHistoryEntry | null
  previousSession: ReportHistoryEntry | null
  bestSession: ReportHistoryEntry | null
  // Percentage-point delta (overall score now vs. the session before it),
  // never a fabricated trend — null when fewer than 2 real reports exist.
  improvementPercent: number | null
}

function overallReportScore(report: VisualIntelligenceReport): number {
  return Math.round(
    (report.observationAccuracy + report.fixationStability + report.afterImageAwareness + report.attentionScore + report.visualRecall) / 5,
  )
}

function isVisualIntelligenceReport(value: unknown): value is VisualIntelligenceReport {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.observationAccuracy === 'number' &&
    typeof record.fixationStability === 'number' &&
    typeof record.afterImageAwareness === 'number' &&
    typeof record.attentionScore === 'number' &&
    typeof record.visualRecall === 'number' &&
    typeof record.recommendation === 'string'
  )
}

function extractReportEntry(session: TratakMissionSessionRecord): ReportHistoryEntry | null {
  if (session.missionId !== 'mandala-persistence' || session.levelNumber === null) return null
  if (typeof session.analyzerData !== 'object' || session.analyzerData === null) return null
  const report = (session.analyzerData as Record<string, unknown>).report
  if (!isVisualIntelligenceReport(report)) return null
  return { occurredAt: session.occurredAt, levelNumber: session.levelNumber, report }
}

// Reads real, previously-persisted Visual Intelligence Reports™ out of
// tratak_mission_sessions rows (as returned by getTratakMissionSessions,
// already newest-first) — a session with no report (e.g. Observation
// Intelligence™ wasn't answered) is silently skipped, never backfilled.
export function computeReportHistory(sessions: readonly TratakMissionSessionRecord[]): ReportHistory {
  const entries = sessions.map(extractReportEntry).filter((entry): entry is ReportHistoryEntry => entry !== null)

  if (entries.length === 0) {
    return { latestSession: null, previousSession: null, bestSession: null, improvementPercent: null }
  }

  const latestSession = entries[0] ?? null
  const previousSession = entries[1] ?? null
  const bestSession = entries.reduce((best, entry) => (overallReportScore(entry.report) > overallReportScore(best.report) ? entry : best))

  const improvementPercent =
    latestSession !== null && previousSession !== null
      ? overallReportScore(latestSession.report) - overallReportScore(previousSession.report)
      : null

  return { latestSession, previousSession, bestSession, improvementPercent }
}
