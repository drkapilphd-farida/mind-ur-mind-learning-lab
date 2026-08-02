import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from '@/lib/subscription/getIsPaidUser'
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
import {
  computeReadingScore,
  computeMindScore as computeMindScore1000,
} from '@/lib/exercises/mindScore'
import { GreetingHeading } from '@/components/dashboard/GreetingHeading'
import { AIMentorSection, AIMentorSkeleton } from '@/components/dashboard/AIMentorSection'
import { TodaysMissionCard } from '@/components/dashboard/TodaysMissionCard'
import { MindScoreCard } from '@/components/dashboard/MindScoreCard'
import { DailyMomentumCard } from '@/components/dashboard/DailyMomentumCard'
import { AIDocumentTransformerWidget } from '@/components/dashboard/AIDocumentTransformerWidget'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { TwentyOneDayJourneyCard } from '@/components/dashboard/TwentyOneDayJourneyCard'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import { NextEvolutionCard } from '@/components/dashboard/NextEvolutionCard'
import { AchievementsCard } from '@/components/dashboard/AchievementsCard'
import { BrainEnergyCard } from '@/components/dashboard/BrainEnergyCard'
import { AIMentorCTA } from '@/components/dashboard/AIMentorCTA'
import { DailyQuantumSessionCard } from '@/components/dashboard/DailyQuantumSessionCard'
import { formatRelativeDate } from '@/lib/formatRelativeDate'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import {
  computeDailyQuantumStreak,
  computeLifetimeXp,
  computePersonalBestWpm,
  computeLongestStreakEver,
  hasCompletedSessionToday,
} from '@/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'
import { getStreakBannerStatus, getNextJourneyDay, getMilestoneHitExactly } from '@/features/quantum-journey/streakMotivation'
import { StreakReminderBanner } from '@/components/dashboard/StreakReminderBanner'

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

  const [labProgress, labSessions, profile, dailyQuantumSessionHistory, isPaidUser, quantumDocumentCount, baselineDiagnostic] =
    await Promise.all([
      getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
      getPracticeSessions('quantum-speed-reading'),
      getCurrentUserProfile(user.id),
      getDailyQuantumSessionHistory(),
      getIsPaidUser(user.id),
      getQuantumDocumentCount(user.id),
      getBaselineDiagnostic(),
    ])

  // ── Daily Quantum Session™ — a separate progress source from the Eye
  // Foundation Module data above (its own table, its own streak/XP
  // concept — never blended into labStreak/mindScore, which mean
  // something narrower).
  const dailyQuantumStreak = computeDailyQuantumStreak(dailyQuantumSessionHistory)
  const dailyQuantumLifetimeXp = computeLifetimeXp(dailyQuantumSessionHistory)
  const dailyQuantumPersonalBestWpm = computePersonalBestWpm(dailyQuantumSessionHistory)
  const dailyQuantumLongestStreakEver = computeLongestStreakEver(dailyQuantumSessionHistory)

  // Dashboard Integration™ — whether the full Analytics Dashboard™ (WPM
  // chart, streak/consistency, Mind Score breakdown) has anything to show
  // yet gates the "View Full Analytics" link below; the numbers
  // themselves live only on that dedicated page now, not duplicated here.
  const hasBaseline = baselineDiagnostic !== null

  // Daily Streak Reminders & Motivation System™ — the banner's status is
  // derived fresh from real session dates every request (no caching, no
  // separately mutable flag), so it's always instantly accurate the
  // moment a new daily_quantum_sessions row exists.
  const streakBannerStatus = getStreakBannerStatus({
    sessionCount: dailyQuantumSessionHistory.length,
    hasCompletedToday: hasCompletedSessionToday(dailyQuantumSessionHistory),
    currentStreak: dailyQuantumStreak,
  })
  const nextJourneyDay = getNextJourneyDay(dailyQuantumSessionHistory.length)
  const milestoneReachedToday = hasCompletedSessionToday(dailyQuantumSessionHistory) ? getMilestoneHitExactly(dailyQuantumStreak) : null

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

  // 0–1000 scale Mind Score — used by NextEvolutionCard and AIMentorCTA.
  // The local mindScore above remains 0–100 for MindScoreCard.
  const readingScore = computeReadingScore(completionPercent, labStreak.currentStreak)
  const mindScore1000 = computeMindScore1000([readingScore])

  // Next Mind Score milestone (0–1000 scale)
  const SCORE_THRESHOLDS = [100, 200, 400, 600, 800, 900, 1000] as const
  const nextMindScoreGoal = SCORE_THRESHOLDS.find((t) => t > mindScore1000) ?? 1000

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
      {/* Daily Streak Reminders & Motivation System™ */}
      <StreakReminderBanner
        studentFirstName={studentFirstName}
        status={streakBannerStatus}
        currentStreak={dailyQuantumStreak}
        nextDay={nextJourneyDay}
        milestoneReachedToday={milestoneReachedToday}
      />

      {/* Hero */}
      <div className="rounded-2xl border bg-gradient-to-br from-foreground/[0.03] to-transparent p-6 sm:p-8">
        <GreetingHeading studentName={studentFirstName} />
        <p className="mt-1 text-sm text-muted-foreground">
          {labSummary.isComplete
            ? 'Eye Foundation Module complete — keep the momentum going.'
            : `${completionPercent}% through the Eye Foundation Module.`}
        </p>

        <div className="mt-5">
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
        </div>

        <Link
          href="/unified-quantum-session-preview"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          🚀 Start Today&rsquo;s 4-Level Quantum Session
        </Link>
      </div>

      {/* AI Document Transformer™ */}
      <AIDocumentTransformerWidget isPro={isPaidUser} initialDocumentCount={quantumDocumentCount} />

      {/* Today's Mission™ + Mind Score™ */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <TodaysMissionCard
          exercises={missionExercises}
          actionHref={labSummary.currentExercise?.href ?? null}
          actionLabel={labSummary.actionLabel ?? 'Begin session'}
          isAllDone={labSummary.isComplete}
          mindScoreGoal={nextMindScoreGoal}
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

      {/* Daily Quantum Session™ */}
      <DailyQuantumSessionCard
        hasAnySession={dailyQuantumSessionHistory.length > 0}
        currentStreak={dailyQuantumStreak}
        lifetimeXp={dailyQuantumLifetimeXp}
        personalBestWpm={dailyQuantumPersonalBestWpm}
        hasBaseline={hasBaseline}
        longestStreakEver={dailyQuantumLongestStreakEver}
      />

      {/* Next Evolution™ — Sprint 3E */}
      <NextEvolutionCard
        currentMindScore={mindScore1000}
        nextMindScoreGoal={nextMindScoreGoal}
        completedCount={labProgress.completedCount}
        totalCount={labProgress.totalCount}
        nextExerciseHref={labSummary.currentExercise?.href ?? null}
        nextExerciseTitle={labSummary.currentExercise?.title ?? null}
      />

      {/* 21-Day Transformation Journey™ */}
      <TwentyOneDayJourneyCard isPaidUser={isPaidUser} isDevUnlocked={isDevUnlockEnabled()} />

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

      {/* AI Coach CTA — Sprint 3E */}
      <AIMentorCTA studentFirstName={studentFirstName} mindScore={mindScore1000} />
    </div>
  )
}
