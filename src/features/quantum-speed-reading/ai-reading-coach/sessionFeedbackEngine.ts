// AI Reading Coach™ — Sprint 5. Session Feedback Engine (Part 1). Every
// line is derived from real, already-persisted session data — no random
// motivational text, no fabricated specifics. Self-contained, imports only
// Sprint-4's types (read-only reuse, never modified).

import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'

export type OverallPerformanceVerdict = 'excellent' | 'good' | 'needs-practice'
export type ReadingBalanceKind = 'too-fast' | 'excellent-balance' | 'too-slow' | 'neutral'

export type SessionFeedbackReport = {
  overallPerformance: { verdict: OverallPerformanceVerdict; label: string }
  speedFeedback: string
  comprehensionFeedback: string
  accuracyFeedback: string
  readingBalance: { kind: ReadingBalanceKind; message: string }
  summary: string
}

function average(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function computeOverallPerformance(session: ReadingSessionRecord): { verdict: OverallPerformanceVerdict; label: string } {
  if (session.readingIntelligenceScore >= 85) return { verdict: 'excellent', label: 'Excellent Reading Session' }
  if (session.readingIntelligenceScore >= 65) return { verdict: 'good', label: 'Good Progress' }
  return { verdict: 'needs-practice', label: 'Needs More Practice' }
}

function computeSpeedFeedback(latest: ReadingSessionRecord, recentAvgWpm: number | null): string {
  if (recentAvgWpm === null || recentAvgWpm <= 0) {
    return `You read at ${latest.wpm} WPM this session — future sessions will compare against your average.`
  }
  const percentChange = Math.round(((latest.wpm - recentAvgWpm) / recentAvgWpm) * 100)
  if (percentChange > 3) return `Your reading speed increased by ${percentChange}% compared to your recent average.`
  if (percentChange < -3) return `Your reading speed eased by ${Math.abs(percentChange)}% compared to your recent average.`
  return `Your reading speed held steady at ${latest.wpm} WPM, close to your recent average.`
}

function computeComprehensionFeedback(latest: ReadingSessionRecord, recentAvgComprehension: number | null): string {
  if (recentAvgComprehension === null) {
    return `You scored ${latest.comprehensionPercent}% comprehension on this first tracked session.`
  }
  const delta = latest.comprehensionPercent - recentAvgComprehension
  if (latest.comprehensionPercent >= 85 && delta >= -3) {
    return `Your comprehension remained excellent at ${latest.comprehensionPercent}%, even alongside your reading pace.`
  }
  if (delta < -8) {
    return `Your comprehension dropped to ${latest.comprehensionPercent}%, below your recent average of ${Math.round(recentAvgComprehension)}%.`
  }
  return `Your comprehension held at ${latest.comprehensionPercent}%, close to your recent average.`
}

function computeAccuracyFeedback(latest: ReadingSessionRecord): string {
  if (latest.accuracyPercent === 100) return `You answered every question correctly this session.`
  if (latest.accuracyPercent >= 80) return `You answered most questions correctly, at ${latest.accuracyPercent}% accuracy.`
  if (latest.accuracyPercent >= 60) return `A few questions caught you off guard — ${latest.accuracyPercent}% accuracy this session.`
  return `Accuracy was low this session at ${latest.accuracyPercent}% — this passage's difficulty may have been a stretch.`
}

// Same speed-vs-comprehension trade-off signal Sprint-4's difficulty/
// recommendation engines already use — reused conceptually, computed
// fresh here so this file stays self-contained.
function computeReadingBalance(latest: ReadingSessionRecord): { kind: ReadingBalanceKind; message: string } {
  if (latest.wpm >= 260 && latest.comprehensionPercent < 75) {
    return { kind: 'too-fast', message: 'You are reading faster than your comprehension allows.' }
  }
  if (latest.wpm <= 160 && latest.comprehensionPercent >= 90) {
    return { kind: 'too-slow', message: 'Your comprehension is excellent — you likely have room to read a little faster.' }
  }
  if (latest.comprehensionPercent >= 80) {
    return { kind: 'excellent-balance', message: 'Excellent balance between speed and understanding.' }
  }
  return { kind: 'neutral', message: 'Your speed and comprehension are still finding their balance.' }
}

function computeSummary(
  latest: ReadingSessionRecord,
  performance: { verdict: OverallPerformanceVerdict; label: string },
  balance: { kind: ReadingBalanceKind; message: string },
): string {
  const openings: Record<OverallPerformanceVerdict, string> = {
    excellent: `You had an excellent session on this ${latest.difficulty} passage.`,
    good: `You made solid progress on this ${latest.difficulty} passage.`,
    'needs-practice': `This ${latest.difficulty} passage was a challenge today.`,
  }
  return `${openings[performance.verdict]} ${balance.message} Keep building on this with your next session.`
}

export function generateSessionFeedbackReport(
  latest: ReadingSessionRecord,
  recentSessions: readonly ReadingSessionRecord[],
): SessionFeedbackReport {
  const recentAvgWpm = average(recentSessions.map((s) => s.wpm))
  const recentAvgComprehension = average(recentSessions.map((s) => s.comprehensionPercent))
  const overallPerformance = computeOverallPerformance(latest)
  const readingBalance = computeReadingBalance(latest)

  return {
    overallPerformance,
    speedFeedback: computeSpeedFeedback(latest, recentAvgWpm),
    comprehensionFeedback: computeComprehensionFeedback(latest, recentAvgComprehension),
    accuracyFeedback: computeAccuracyFeedback(latest),
    readingBalance,
    summary: computeSummary(latest, overallPerformance, readingBalance),
  }
}
