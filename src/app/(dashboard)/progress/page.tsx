import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import {
  computeDailyStreak,
  computeWeeklyActivity,
  computeTotalPracticeStats,
} from '@/lib/exercises/practiceHistory'
import {
  computeReadingScore,
  computeMindScore,
  getMindScoreLabel,
  computeWeeklyTrend,
  computeJourneyStatus,
  buildJourneyStatusMeta,
  buildStrengthSummary,
} from '@/lib/exercises/mindScore'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { MindScoreHeroCard } from '@/components/mindScore/MindScoreHeroCard'
import { DimensionScoreGrid } from '@/components/mindScore/DimensionScoreGrid'
import { GrowthTrendChart } from '@/components/mindScore/GrowthTrendChart'
import { MindScoreInsightsSection, MindScoreInsightsSkeleton } from '@/components/mindScore/MindScoreInsightsSection'
import { StrengthAreasCard } from '@/components/mindScore/StrengthAreasCard'
import { TodaysRecommendationCard } from '@/components/mindScore/TodaysRecommendationCard'
import { WeeklyIntelligenceReport } from '@/components/mindScore/WeeklyIntelligenceReport'
import { MindJourneyCard } from '@/components/mindScore/MindJourneyCard'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'

export const metadata: Metadata = {
  title: 'Mind Score™',
}

const EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((ex) => ex.exerciseId)

// Derives the weekly trend label used by WeeklyIntelligenceReport from a
// numeric trend value. Positive = up, negative = down, null/zero = stable.
function toTrendLabel(trend: number | null): 'up' | 'down' | 'stable' {
  if (trend === null) return 'stable'
  if (trend > 5) return 'up'
  if (trend < -5) return 'down'
  return 'stable'
}

// Derives an overall growth classification for the Weekly Intelligence Report.
function toOverallGrowth(
  trend: number | null,
  streak: number,
  completedCount: number,
): 'Excellent' | 'Good' | 'Steady' | 'Recovering' | 'Beginning' {
  if (completedCount === 0) return 'Beginning'
  if (streak === 0) return 'Recovering'
  if (trend !== null && trend > 20 && streak >= 3) return 'Excellent'
  if (trend !== null && trend > 0 && streak >= 1) return 'Good'
  return 'Steady'
}

export default async function MindScorePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div />

  const [labProgress, labSessions, profile] = await Promise.all([
    getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
    getCurrentUserProfile(user.id),
  ])

  // ── Core data ─────────────────────────────────────────────────────────────
  const labSummary = getContinueLearningSummary(labProgress, EYE_FOUNDATION_MODULE)
  const labStreak = computeDailyStreak(labSessions)
  const labWeek = computeWeeklyActivity(labSessions)
  const labTotals = computeTotalPracticeStats(labSessions)

  const completionPercent = labProgress.totalCount > 0
    ? Math.round((labProgress.completedCount / labProgress.totalCount) * 100)
    : 0

  // ── Mind Score™ computation ───────────────────────────────────────────────
  const readingScore = computeReadingScore(completionPercent, labStreak.currentStreak)
  const mindScore = computeMindScore([readingScore]) // expand array when new Labs ship
  const scoreMeta = getMindScoreLabel(mindScore)
  const weeklyTrend = computeWeeklyTrend(labWeek)
  const journeyStatus = computeJourneyStatus(labStreak.currentStreak, labProgress.completedCount, weeklyTrend)
  const journeyMeta = buildJourneyStatusMeta(
    labStreak.currentStreak,
    labStreak.bestStreak,
    labWeek.filter((d) => d.sessionCount > 0).length,
    labProgress.completedCount,
    weeklyTrend,
  )
  const strengthSummary = buildStrengthSummary(readingScore, weeklyTrend, labStreak.currentStreak)

  const personalBestMs = Math.max(...labSessions.map((s) => s.durationMs), 0)
  const studentName = profile?.fullName ?? 'there'

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mind Score™</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your living intelligence score — updated with every session.
        </p>
      </div>

      {/* 1. Hero */}
      <MindScoreHeroCard
        score={mindScore}
        scoreMeta={scoreMeta}
        readingScore={readingScore}
      />

      {/* 2. Dimension scores */}
      <DimensionScoreGrid
        readingScore={readingScore}
        weeklyTrend={weeklyTrend}
      />

      {/* 3. Growth Trend + Today's Recommendation (side by side on desktop) */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <GrowthTrendChart
          days={labWeek}
          personalBestMs={personalBestMs}
          weeklyTrend={weeklyTrend}
          totalSessions={labTotals.totalCompletedSessions}
        />
        <TodaysRecommendationCard
          exerciseTitle={labSummary.currentExercise?.title ?? null}
          exerciseHref={labSummary.currentExercise?.href ?? null}
          actionLabel={labSummary.actionLabel}
          isComplete={labSummary.isComplete}
        />
      </div>

      {/* 4. AI Insights — Suspense-streamed */}
      <Suspense fallback={<MindScoreInsightsSkeleton />}>
        <MindScoreInsightsSection
          studentName={studentName}
          mindScore={mindScore}
          readingScore={readingScore}
          weeklyTrend={weeklyTrend}
          currentStreak={labStreak.currentStreak}
          completedCount={labProgress.completedCount}
          totalCount={labProgress.totalCount}
          journeyStatus={journeyStatus}
        />
      </Suspense>

      {/* 5. Strength Areas */}
      <StrengthAreasCard {...strengthSummary} />

      {/* 6. Weekly Intelligence Report + Mind Journey (side by side on desktop) */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <WeeklyIntelligenceReport
          readingTrend={toTrendLabel(weeklyTrend)}
          readingScore={readingScore}
          overallGrowth={toOverallGrowth(weeklyTrend, labStreak.currentStreak, labProgress.completedCount)}
        />
        <MindJourneyCard
          {...journeyMeta}
          currentStreak={labStreak.currentStreak}
          bestStreak={labStreak.bestStreak}
          totalSessions={labTotals.totalCompletedSessions}
          completedCount={labProgress.completedCount}
          totalCount={labProgress.totalCount}
        />
      </div>
    </div>
  )
}
