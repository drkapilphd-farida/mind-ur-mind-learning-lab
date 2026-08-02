import { WpmProgressChart } from './WpmProgressChart'
import { StreakConsistencyCard } from './StreakConsistencyCard'
import { MindScoreBreakdownCard } from './MindScoreBreakdownCard'
import type { WpmChartPoint } from '../analyticsMath'

export type AnalyticsDashboardProps = {
  hasBaseline: boolean
  wpmChartPoints: readonly WpmChartPoint[]
  speedGrowthPercent: number | null
  latestWpm: number | null
  latestAccuracyPercent: number | null
  currentStreak: number
  totalSessions: number
  consistencyPercent: number
  mindScore: number
  readingComprehensionScore: number | null
  brainGymAccuracyScore: number | null
}

// Analytics Dashboard™ — the comprehensive, real-data-only home for the
// 21-Day Transformation Journey's own growth story: the immutable Day 1
// Baseline vs. current WPM (journey_baseline_diagnostics vs.
// daily_quantum_sessions), consistency/streak, and a real Mind Score
// breakdown. Deliberately its own dedicated page rather than folded into
// the main dashboard — that page's own DailyQuantumSessionCard already
// links here rather than duplicating these same numbers in miniature.
export function AnalyticsDashboard({
  hasBaseline,
  wpmChartPoints,
  speedGrowthPercent,
  latestWpm,
  latestAccuracyPercent,
  currentStreak,
  totalSessions,
  consistencyPercent,
  mindScore,
  readingComprehensionScore,
  brainGymAccuracyScore,
}: AnalyticsDashboardProps): React.JSX.Element {
  if (!hasBaseline) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Analytics Dashboard™</p>
        <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">Your Growth Story Starts With a Baseline</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Complete the mandatory Baseline Reading Speed Diagnostic before Day 1 to unlock your analytics here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <WpmProgressChart
        points={wpmChartPoints}
        growthPercent={speedGrowthPercent}
        latestWpm={latestWpm}
        latestAccuracyPercent={latestAccuracyPercent}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <StreakConsistencyCard currentStreak={currentStreak} totalSessions={totalSessions} consistencyPercent={consistencyPercent} />
        <MindScoreBreakdownCard
          mindScore={mindScore}
          readingComprehensionScore={readingComprehensionScore}
          brainGymAccuracyScore={brainGymAccuracyScore}
        />
      </div>
    </div>
  )
}
