import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import {
  computeDailyStreak,
  computeTodaysProgress,
  computeWeeklyActivity,
  computeTotalPracticeStats,
} from '@/lib/exercises/practiceHistory'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { GreetingHeading } from '@/components/dashboard/GreetingHeading'
import { AIMentorSection, AIMentorSkeleton } from '@/components/dashboard/AIMentorSection'
import { TodaysMissionCard } from '@/components/dashboard/TodaysMissionCard'
import { MindScoreCard } from '@/components/dashboard/MindScoreCard'
import { DailyMomentumCard } from '@/components/dashboard/DailyMomentumCard'
import { QuickPracticeGrid } from '@/components/dashboard/QuickPracticeGrid'
import { TransformationJourneyCard } from '@/components/dashboard/TransformationJourneyCard'
import { AchievementsCard } from '@/components/dashboard/AchievementsCard'
import { BrainEnergyCard } from '@/components/dashboard/BrainEnergyCard'
import { formatRelativeDate } from '@/lib/formatRelativeDate'

export const metadata: Metadata = {
  title: 'Transformation Dashboard',
}

const EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((ex) => ex.exerciseId)

// Mind Score: weighted blend of Reading progress (60%) and streak
// consistency (40%), capped at 100. Grows as the student practices more
// and maintains a longer streak. Never fabricated — always from real data.
function computeMindScore(completionPercent: number, currentStreak: number): number {
  const practiceComponent = Math.round(completionPercent * 0.6)
  const consistencyComponent = Math.round(Math.min(currentStreak / 14, 1) * 100 * 0.4)
  return Math.min(100, practiceComponent + consistencyComponent)
}

// Returns the 3 exercises centered around the student's current position:
// the last completed, the current (to-do next), and the upcoming one.
// All statuses come from real exercise_progress data — nothing is fabricated.
function buildMissionExercises(
  completedCount: number,
  totalCount: number,
  nextId: string | null,
  statusById: Record<string, string>,
): Array<{ id: string; title: string; status: 'completed' | 'current' | 'upcoming' }> {
  if (completedCount >= totalCount && totalCount > 0) {
    // Module complete — show last 3 as all completed
    return EYE_FOUNDATION_MODULE.slice(-3).map((ex) => ({
      id: ex.exerciseId,
      title: ex.title,
      status: 'completed',
    }))
  }

  const currentIndex = nextId
    ? EYE_FOUNDATION_MODULE.findIndex((ex) => ex.exerciseId === nextId)
    : 0
  const start = Math.max(0, currentIndex - 1)
  const slice = EYE_FOUNDATION_MODULE.slice(start, start + 3)

  return slice.map((ex) => {
    const s = statusById[ex.exerciseId]
    if (s === 'completed') return { id: ex.exerciseId, title: ex.title, status: 'completed' as const }
    if (ex.exerciseId === nextId) return { id: ex.exerciseId, title: ex.title, status: 'current' as const }
    return { id: ex.exerciseId, title: ex.title, status: 'upcoming' as const }
  })
}

export default async function TransformationDashboard(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

  const [labProgress, labSessions, profile] = await Promise.all([
    getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
    getCurrentUserProfile(user.id),
  ])

  // ── Derived data from Learning Journey Engine ────────────────────────────
  const labSummary = getContinueLearningSummary(labProgress, EYE_FOUNDATION_MODULE)
  const labStreak = computeDailyStreak(labSessions)
  const labToday = computeTodaysProgress(labSessions)
  const labWeek = computeWeeklyActivity(labSessions)
  const labTotals = computeTotalPracticeStats(labSessions)

  const completionPercent = labProgress.totalCount > 0
    ? Math.round((labProgress.completedCount / labProgress.totalCount) * 100)
    : 0

  // ── New computations (all from real data) ────────────────────────────────
  const mindScore = computeMindScore(completionPercent, labStreak.currentStreak)
  const weeklyActiveDays = labWeek.filter((d) => d.sessionCount > 0).length
  const consistencyPercent = Math.round((weeklyActiveDays / 7) * 100)

  // Yesterday is the second-to-last element in the 7-day array
  const yesterday = labWeek[labWeek.length - 2]

  const missionExercises = buildMissionExercises(
    labProgress.completedCount,
    labProgress.totalCount,
    labProgress.nextRecommendedExerciseId ?? null,
    labProgress.statusByExerciseId as Record<string, string>,
  )

  const studentName = profile?.fullName ?? 'there'
  const studentFirstName = studentName.trim().split(' ').at(0) ?? 'there'

  const lastPracticedLabel = labStreak.lastPracticedDateKey !== null
    ? formatRelativeDate(labStreak.lastPracticedDateKey)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <GreetingHeading studentName={studentFirstName} />
        <p className="mt-1 text-sm text-muted-foreground">
          {labSummary.isComplete
            ? 'Eye Foundation Module complete — keep the momentum going.'
            : `${completionPercent}% through the Eye Foundation Module.`}
        </p>
      </div>

      {/* AI Mentor™ — Suspense-streamed so the rest of the page is instant */}
      <Suspense fallback={<AIMentorSkeleton />}>
        <AIMentorSection
          studentName={studentName}
          currentStreak={labStreak.currentStreak}
          bestStreak={labStreak.bestStreak}
          completedCount={labProgress.completedCount}
          totalCount={labProgress.totalCount}
          todaySessionCount={labToday.exercisesCompletedToday}
          totalCompletedSessions={labTotals.totalCompletedSessions}
        />
      </Suspense>

      {/* Today's Mission™ + Mind Score™ */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <TodaysMissionCard
          exercises={missionExercises}
          actionHref={labSummary.currentExercise?.href ?? null}
          actionLabel={labSummary.actionLabel ?? 'Begin session'}
          isAllDone={labSummary.isComplete}
        />
        <MindScoreCard
          mindScore={mindScore}
          readingScore={completionPercent}
        />
      </div>

      {/* Daily Momentum™ */}
      <DailyMomentumCard
        currentStreak={labStreak.currentStreak}
        bestStreak={labStreak.bestStreak}
        consistencyPercent={consistencyPercent}
        lastPracticedLabel={lastPracticedLabel}
      />

      {/* Quick Practice™ */}
      <QuickPracticeGrid />

      {/* Transformation Journey™ */}
      <TransformationJourneyCard
        yesterdaySessionCount={yesterday?.sessionCount ?? 0}
        yesterdayDurationMs={yesterday?.durationMs ?? 0}
        todaySessionCount={labToday.exercisesCompletedToday}
        todayDurationMs={labToday.totalDurationMsToday}
        nextExerciseTitle={labSummary.currentExercise?.title ?? null}
        nextExerciseHref={labSummary.currentExercise?.href ?? null}
        weeklyActiveDays={weeklyActiveDays}
        currentStreak={labStreak.currentStreak}
      />

      {/* Achievements™ */}
      <AchievementsCard
        completedCount={labProgress.completedCount}
        totalCount={labProgress.totalCount}
        currentStreak={labStreak.currentStreak}
        bestStreak={labStreak.bestStreak}
        totalCompletedSessions={labTotals.totalCompletedSessions}
      />

      {/* Brain Energy™ */}
      <BrainEnergyCard />
    </div>
  )
}
