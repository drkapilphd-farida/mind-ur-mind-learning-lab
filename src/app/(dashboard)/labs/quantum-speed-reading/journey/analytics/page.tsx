import type { Metadata } from 'next'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'
import { AnalyticsDashboard } from '@/features/quantum-journey/analytics/components/AnalyticsDashboard'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { getDomainPerformanceSummary } from '@/features/quantum-journey/analytics/queries/getDomainPerformanceSummary'
import { computeDailyQuantumStreak } from '@/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking'
import { computeMindScore } from '@/lib/exercises/mindScore'
import { computeConsistencyPercent, computeAverageAccuracyPercent, computeHabitCompletionPercent } from '@/features/quantum-journey/analytics/analyticsMath'

export const metadata: Metadata = {
  title: 'Analytics Dashboard™ — Quantum Mindset & Habit Builder™',
  description: 'Your habit completion rate, streak, consistency, and Mind Score breakdown.',
}

// Analytics Dashboard™ — a dedicated page rather than more cards bolted
// onto the already-long main dashboard (see AnalyticsDashboard.tsx's own
// comment). Every figure here comes from real, already-persisted data:
// journey_baseline_diagnostics (gates access until Day 1's mandatory
// baseline is done), daily_quantum_sessions (every real journey session
// since), and domain_performance_sessions (Brain-Gym Accuracy). Nothing
// is fabricated — dimensions with no real tracked source (Focus) render
// locked, the same convention the main dashboard's MindScoreCard already
// established.
//
// Habit App Isolation™ — this page is habit-domain-only (see
// src/middleware.ts's DOMAIN_ROUTES), so its metrics are chosen for a
// pure habit-building context: Habit Completion Rate, streak,
// consistency, and Retention Accuracy — never WPM/speed-reading figures.
export default async function JourneyAnalyticsPage(): Promise<React.JSX.Element> {
  const [baselineDiagnostic, readingHistory, domainSummary] = await Promise.all([
    getBaselineDiagnostic(),
    getDailyQuantumSessionHistory(),
    getDomainPerformanceSummary(),
  ])

  const currentStreak = computeDailyQuantumStreak(readingHistory)
  const consistencyPercent = computeConsistencyPercent(readingHistory)
  const completionPercent = computeHabitCompletionPercent(readingHistory.length)

  const retentionAccuracyScore = computeAverageAccuracyPercent(readingHistory)
  const brainGymAccuracyScore = domainSummary?.averageAccuracyPercent ?? null
  const activeDimensionScores = [retentionAccuracyScore, brainGymAccuracyScore].filter(
    (score): score is number => score !== null,
  )
  const mindScore = computeMindScore(activeDimensionScores)

  return (
    <div>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <LabPageHeader
          eyebrow="Quantum Mindset & Habit Builder™"
          title="Analytics Dashboard™"
          subtitle="Your real growth story — Day 1 Baseline through today."
        />

        <div className="mt-8">
          <AnalyticsDashboard
            hasBaseline={baselineDiagnostic !== null}
            currentStreak={currentStreak}
            totalSessions={readingHistory.length}
            consistencyPercent={consistencyPercent}
            completionPercent={completionPercent}
            mindScore={mindScore}
            retentionAccuracyScore={retentionAccuracyScore}
            brainGymAccuracyScore={brainGymAccuracyScore}
          />
        </div>
      </div>
    </div>
  )
}
