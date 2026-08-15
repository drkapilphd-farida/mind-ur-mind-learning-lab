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
  computeReadingSpeedScore,
  computeWpmGrowth,
  computeComprehensionAccuracyScore,
  computeVisualizationDepthScore,
  computeConsistencyMomentumScore,
  computeNeuralRetrainingIndex,
} from '@/lib/exercises/mindScore'
import { getReadingIntelligenceSessions } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { computeFocusScore, getHighestDifficultyRatio } from '@/features/visual-intelligence/fixation/focusScore'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { MindScoreHeroCard } from '@/components/mindScore/MindScoreHeroCard'
import { DimensionScoreGrid } from '@/components/mindScore/DimensionScoreGrid'
import { GrowthTrendChart } from '@/components/mindScore/GrowthTrendChart'
import { MindScoreInsightsSection, MindScoreInsightsSkeleton } from '@/components/mindScore/MindScoreInsightsSection'
import { StrengthAreasCard } from '@/components/mindScore/StrengthAreasCard'
import { TodaysRecommendationCard } from '@/components/mindScore/TodaysRecommendationCard'
import { WeeklyIntelligenceReport, type WeeklyDimensionEntry } from '@/components/mindScore/WeeklyIntelligenceReport'
import { MindJourneyCard } from '@/components/mindScore/MindJourneyCard'
import { CurriculumMilestoneTimeline } from '@/components/mindScore/CurriculumMilestoneTimeline'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'

export const metadata: Metadata = {
  title: 'Mind Score™',
}

const EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((ex) => ex.exerciseId)

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

function growthPercentToTrend(percent: number | null): 'up' | 'down' | 'stable' | null {
  if (percent === null) return null
  if (percent > 0) return 'up'
  if (percent < 0) return 'down'
  return 'stable'
}

export default async function MindScorePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div />

  const [labProgress, labSessions, profile, readingSessions, fixationSessions] = await Promise.all([
    getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
    getCurrentUserProfile(user.id),
    getReadingIntelligenceSessions(),
    getFixationSessions(),
  ])

  // ── Core practice data ──────────────────────────────────────────────────
  const labSummary = getContinueLearningSummary(labProgress, EYE_FOUNDATION_MODULE)
  const labStreak = computeDailyStreak(labSessions)
  const labWeek = computeWeeklyActivity(labSessions)
  const labTotals = computeTotalPracticeStats(labSessions)

  // Eye Foundation Module completion+streak score — a genuinely different
  // real signal from the Adaptive Reading Intelligence WPM/comprehension
  // scores below (separate feature, separate table). Kept under its
  // original name/shape since MindScoreHeroCard's ring and the AI
  // Insights copy ("X exercises remain in the Eye Foundation Module")
  // are written specifically about this number — swapping in the WPM
  // score here would make that copy factually wrong.
  const completionPercent = labProgress.totalCount > 0 ? Math.round((labProgress.completedCount / labProgress.totalCount) * 100) : 0
  const readingScore = computeReadingScore(completionPercent, labStreak.currentStreak)

  // ── Reading Speed + Comprehension Accuracy — real Adaptive Reading
  //     Intelligence data (reading_intelligence_sessions) ──────────────────
  const readingProfile = computeReadingProfile(readingSessions)
  const readingSpeedScore = computeReadingSpeedScore(readingProfile.averageWpm, readingProfile.sessionsCompleted)
  const wpmGrowth = computeWpmGrowth(readingSessions)
  const comprehensionScore = computeComprehensionAccuracyScore(
    readingProfile.averageAccuracy,
    readingProfile.averageComprehension,
    readingProfile.sessionsCompleted,
  )

  // ── Right-Brain Visualization Depth — real Visual Fixation Engine data
  //     (fixation_sessions), reusing its own computeFocusScore ────────────
  const completedFixationSessions = fixationSessions.filter((s) => s.completed)
  const fixationStreak = computeDailyStreak(
    fixationSessions.map((s) => ({
      exerciseId: s.exerciseType,
      durationMs: s.durationSeconds * 1000,
      completed: s.completed,
      occurredAt: s.occurredAt,
    })),
  )
  const focusScore = computeFocusScore({
    completedSessionCount: completedFixationSessions.length,
    currentStreak: fixationStreak.currentStreak,
    highestDifficultyRatio: getHighestDifficultyRatio(fixationSessions),
    totalDurationSeconds: completedFixationSessions.reduce((sum, s) => sum + s.durationSeconds, 0),
  })
  const visualizationDepthScore = computeVisualizationDepthScore(fixationSessions.length, focusScore)

  // ── Mind Score™ computation ───────────────────────────────────────────────
  const weeklyTrend = computeWeeklyTrend(labWeek)
  const journeyStatus = computeJourneyStatus(labStreak.currentStreak, labProgress.completedCount, weeklyTrend)
  const journeyMeta = buildJourneyStatusMeta(
    labStreak.currentStreak,
    labStreak.bestStreak,
    labWeek.filter((d) => d.sessionCount > 0).length,
    labProgress.completedCount,
    weeklyTrend,
  )

  // Consistency & Streak Momentum + the small, auditable Neural Retraining
  // Index composite — see mindScore.ts for exactly what each blends.
  const consistencyScore = computeConsistencyMomentumScore(
    journeyMeta.consistencyPercent,
    journeyMeta.momentumPercent,
    labProgress.completedCount > 0,
  )
  const neuralRetrainingIndex = computeNeuralRetrainingIndex(readingSpeedScore, comprehensionScore, consistencyScore)

  // Overall Mind Score™ averages every ACTIVE (non-null) dimension
  // computable server-side, including the original Eye Foundation Module
  // readingScore. QSR/Holographic Recall is deliberately excluded here —
  // its one real signal lives in localStorage (see DimensionScoreGrid.tsx),
  // not reachable from this server component — and Neural Retraining
  // Index is excluded to avoid double-counting the scores it's already
  // derived from.
  const activeDimensionScores = [readingScore, readingSpeedScore, comprehensionScore, visualizationDepthScore, consistencyScore].filter(
    (s): s is number => s !== null,
  )
  const mindScore = computeMindScore(activeDimensionScores)
  const scoreMeta = getMindScoreLabel(mindScore)

  const strengthSummary = buildStrengthSummary(
    [
      { label: 'Reading Intelligence', score: readingScore, trendPercent: weeklyTrend },
      { label: 'Reading Speed (WPM Growth)', score: readingSpeedScore, trendPercent: wpmGrowth?.growthPercent ?? null },
      { label: 'Comprehension Accuracy', score: comprehensionScore, trendPercent: null },
      { label: 'Right-Brain Visualization Depth', score: visualizationDepthScore, trendPercent: null },
      { label: 'Consistency & Streak Momentum', score: consistencyScore, trendPercent: null },
      { label: 'Neural Retraining Index', score: neuralRetrainingIndex, trendPercent: null },
    ],
    labStreak.currentStreak,
  )

  const weeklyDimensions: WeeklyDimensionEntry[] = [
    { id: 'reading-speed', label: 'Reading Speed', score: readingSpeedScore, trend: growthPercentToTrend(wpmGrowth?.growthPercent ?? null) },
    { id: 'comprehension', label: 'Comprehension', score: comprehensionScore, trend: comprehensionScore === null ? null : 'stable' },
    { id: 'visualization', label: 'Visualization', score: visualizationDepthScore, trend: visualizationDepthScore === null ? null : 'stable' },
    { id: 'consistency', label: 'Consistency', score: consistencyScore, trend: consistencyScore === null ? null : 'stable' },
    { id: 'neural-retraining', label: 'Neural Retraining', score: neuralRetrainingIndex, trend: neuralRetrainingIndex === null ? null : 'stable' },
  ]

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

      {/* 2. Dimension scores — six real, active cognitive metrics */}
      <DimensionScoreGrid
        readingSpeedScore={readingSpeedScore}
        readingSpeedTrend={wpmGrowth?.growthPercent ?? null}
        comprehensionScore={comprehensionScore}
        visualizationDepthScore={visualizationDepthScore}
        consistencyScore={consistencyScore}
        neuralRetrainingIndex={neuralRetrainingIndex}
      />

      {/* 3. 30-Day Milestone Timeline */}
      <CurriculumMilestoneTimeline />

      {/* 4. Growth Trend + Today's Recommendation (side by side on desktop) */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <GrowthTrendChart
          days={labWeek}
          personalBestMs={personalBestMs}
          weeklyTrend={weeklyTrend}
          totalSessions={labTotals.totalCompletedSessions}
          wpmGrowth={wpmGrowth}
        />
        <TodaysRecommendationCard
          exerciseTitle={labSummary.currentExercise?.title ?? null}
          exerciseHref={labSummary.currentExercise?.href ?? null}
          actionLabel={labSummary.actionLabel}
          isComplete={labSummary.isComplete}
        />
      </div>

      {/* 5. AI Insights — Suspense-streamed */}
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

      {/* 6. Strength Areas */}
      <StrengthAreasCard {...strengthSummary} />

      {/* 7. Weekly Intelligence Report + Mind Journey (side by side on desktop) */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <WeeklyIntelligenceReport
          dimensions={weeklyDimensions}
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
