import type { Metadata } from 'next'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'
import { AnalyticsDashboard } from '@/features/quantum-journey/analytics/components/AnalyticsDashboard'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { getDomainPerformanceSummary } from '@/features/quantum-journey/analytics/queries/getDomainPerformanceSummary'
import { computeDailyQuantumStreak } from '@/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking'
import { computeMindScore } from '@/lib/exercises/mindScore'
import {
  buildWpmChartPoints,
  computeSpeedGrowthPercent,
  computeConsistencyPercent,
  computeAverageAccuracyPercent,
} from '@/features/quantum-journey/analytics/analyticsMath'

export const metadata: Metadata = {
  title: 'Analytics Dashboard™ — Quantum Mindset & Habit Builder™',
  description: 'Your Day 1 Baseline vs. current reading speed, streak, consistency, and Mind Score breakdown.',
}

// Analytics Dashboard™ — a dedicated page rather than more cards bolted
// onto the already-long main dashboard (see AnalyticsDashboard.tsx's own
// comment). Every figure here comes from real, already-persisted data:
// journey_baseline_diagnostics (Day 1 Baseline), daily_quantum_sessions
// (every real journey session since), and domain_performance_sessions
// (Brain-Gym Accuracy). Nothing is fabricated — dimensions with no real
// tracked source (Focus) render locked, the same convention the main
// dashboard's MindScoreCard already established.
export default async function JourneyAnalyticsPage(): Promise<React.JSX.Element> {
  const [baselineDiagnostic, readingHistory, domainSummary] = await Promise.all([
    getBaselineDiagnostic(),
    getDailyQuantumSessionHistory(),
    getDomainPerformanceSummary(),
  ])

  const baselineWpm = baselineDiagnostic?.trueBaselineWpm ?? null
  const latestSession = readingHistory[0] ?? null

  const wpmChartPoints = buildWpmChartPoints(baselineWpm, readingHistory)
  const speedGrowthPercent = computeSpeedGrowthPercent(baselineWpm, latestSession?.readingWpm ?? null)
  const currentStreak = computeDailyQuantumStreak(readingHistory)
  const consistencyPercent = computeConsistencyPercent(readingHistory)

  const readingComprehensionScore = computeAverageAccuracyPercent(readingHistory)
  const brainGymAccuracyScore = domainSummary?.averageAccuracyPercent ?? null
  const activeDimensionScores = [readingComprehensionScore, brainGymAccuracyScore].filter(
    (score): score is number => score !== null,
  )
  const mindScore = computeMindScore(activeDimensionScores)

  return (
    <div>
      <LabNavHeader currentSection="Analytics" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <LabPageHeader
          eyebrow="Quantum Mindset & Habit Builder™"
          title="Analytics Dashboard™"
          subtitle="Your real growth story — Day 1 Baseline through today."
        />

        <div className="mt-8">
          <AnalyticsDashboard
            hasBaseline={baselineDiagnostic !== null}
            wpmChartPoints={wpmChartPoints}
            speedGrowthPercent={speedGrowthPercent}
            latestWpm={latestSession?.readingWpm ?? null}
            latestAccuracyPercent={latestSession?.accuracyPercent ?? null}
            currentStreak={currentStreak}
            totalSessions={readingHistory.length}
            consistencyPercent={consistencyPercent}
            mindScore={mindScore}
            readingComprehensionScore={readingComprehensionScore}
            brainGymAccuracyScore={brainGymAccuracyScore}
          />
        </div>
      </div>
    </div>
  )
}
