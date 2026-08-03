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
  computeTotalPracticeStats,
} from '@/lib/exercises/practiceHistory'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import {
  computeReadingScore,
  computeMemoryScore,
  computeMindScore as computeMindScore1000,
} from '@/lib/exercises/mindScore'
import { GreetingHeading } from '@/components/dashboard/GreetingHeading'
import { AIMentorSection, AIMentorSkeleton } from '@/components/dashboard/AIMentorSection'
import { MindScoreCard } from '@/components/dashboard/MindScoreCard'
import { DailyMomentumCard } from '@/components/dashboard/DailyMomentumCard'
import { AIDocumentTransformerWidget } from '@/components/dashboard/AIDocumentTransformerWidget'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { getQuantumDocumentHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentHistory'
import { getQuantumDocumentSessionHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentSessionHistory'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getFixationStats } from '@/features/visual-intelligence/fixation/queries/getFixationStats'
import { TwentyOneDayJourneyCard } from '@/components/dashboard/TwentyOneDayJourneyCard'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
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
} from '@/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'
import { getNextJourneyDay } from '@/features/quantum-journey/streakMotivation'

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

export default async function TransformationDashboard(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

  const [
    labProgress,
    labSessions,
    profile,
    dailyQuantumSessionHistory,
    isPaidUser,
    quantumDocumentCount,
    baselineDiagnostic,
    recentQuantumDocuments,
    quantumDocumentSessionHistory,
    fixationSessions,
  ] = await Promise.all([
    getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
    getCurrentUserProfile(user.id),
    getDailyQuantumSessionHistory(),
    getIsPaidUser(user.id),
    getQuantumDocumentCount(user.id),
    getBaselineDiagnostic(),
    getQuantumDocumentHistory(),
    getQuantumDocumentSessionHistory(),
    getFixationSessions(),
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

  // The next real 21-Day Journey day (1-21) — same value the removed
  // StreakReminderBanner's own "Day N is waiting for you" CTA used to
  // compute, now passed straight into TwentyOneDayJourneyCard so its
  // featured row reflects real progress instead of a hardcoded Day 1.
  const nextJourneyDay = getNextJourneyDay(dailyQuantumSessionHistory.length)

  // ── Derived data from Learning Journey Engine ────────────────────────────
  const labSummary = getContinueLearningSummary(labProgress, EYE_FOUNDATION_MODULE)
  const labStreak = computeDailyStreak(labSessions)
  const labToday = computeTodaysProgress(labSessions)
  const labTotals = computeTotalPracticeStats(labSessions)

  const completionPercent = labProgress.totalCount > 0
    ? Math.round((labProgress.completedCount / labProgress.totalCount) * 100)
    : 0

  // ── New computations (all from real data) ────────────────────────────────
  const mindScore = computeMindScore(completionPercent, labStreak.currentStreak)

  // 0–1000 scale Mind Score — used by AIMentorCTA. The local mindScore
  // above remains 0–100 for MindScoreCard.
  const readingScore = computeReadingScore(completionPercent, labStreak.currentStreak)
  const mindScore1000 = computeMindScore1000([readingScore])

  // Mind Score breakdown — Memory (AI Document Transformer recall-quiz
  // accuracy) and Focus (Visual Fixation Engine's own real, already-
  // computed focus score) — both real proxies, both null (locked in the
  // UI) until the student has real activity to derive them from, never a
  // fabricated starting number.
  const memoryScore = computeMemoryScore(quantumDocumentSessionHistory)
  const fixationStats = getFixationStats(fixationSessions)
  const focusScore = fixationStats.completedSessionCount > 0 ? fixationStats.focusScore : null

  const studentName = profile?.fullName ?? 'there'
  const studentFirstName = studentName.trim().split(' ').at(0) ?? 'there'

  const lastPracticedLabel = labStreak.lastPracticedDateKey !== null
    ? formatRelativeDate(labStreak.lastPracticedDateKey)
    : null

  return (
    <div className="glass-premium relative -m-6 space-y-4 p-6 sm:-m-8 sm:space-y-6 sm:p-8">
      {/* Dashboard Glass™ ambient background — fixed so it stays full-
          viewport regardless of this page's own scroll position or the
          parent layout's max-w-4xl centering; -z-10 keeps it behind both
          this content and the (opaque, unrelated) sidebar. Scoped to this
          page only — no other route renders this. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glass-ambient-blob" style={{ width: 520, height: 520, top: -140, left: -100, background: 'var(--ambient-a)' }} />
        <div className="glass-ambient-blob" style={{ width: 460, height: 460, top: 220, right: -140, background: 'var(--ambient-b)' }} />
        <div className="glass-ambient-blob" style={{ width: 380, height: 380, bottom: -160, left: '35%', background: 'var(--ambient-a)' }} />
      </div>

      {/* Hero */}
      <div className="glass-premium-card glass-premium-lift p-6 sm:p-8">
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
          className="brand-gradient glass-premium-lift mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          🚀 Start Today&rsquo;s 4-Level Quantum Session
        </Link>
      </div>

      {/* AI Document Transformer™ — anchor target for Choose Your Path™'s
          "Upload & Learn™" card (/dashboard#upload-document), the direct,
          one-click destination for uploading a document from onboarding. */}
      <div id="upload-document">
        <AIDocumentTransformerWidget
          isPro={isPaidUser}
          initialDocumentCount={quantumDocumentCount}
          recentDocuments={recentQuantumDocuments.slice(0, 1)}
        />
      </div>

      {/* Mind Score™ */}
      <MindScoreCard
        mindScore={mindScore}
        readingScore={completionPercent}
        memoryScore={memoryScore}
        focusScore={focusScore}
      />

      {/* Daily Momentum™ */}
      <DailyMomentumCard
        currentStreak={labStreak.currentStreak}
        bestStreak={labStreak.bestStreak}
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

      {/* 21-Day Transformation Journey™ */}
      <TwentyOneDayJourneyCard isPaidUser={isPaidUser} isDevUnlocked={isDevUnlockEnabled()} currentDay={nextJourneyDay} />

      {/* Achievements™ */}
      <AchievementsCard
        completedCount={labProgress.completedCount}
        totalCount={labProgress.totalCount}
        currentStreak={labStreak.currentStreak}
        bestStreak={labStreak.bestStreak}
        totalCompletedSessions={labTotals.totalCompletedSessions}
        quantumDocumentCount={quantumDocumentCount}
      />

      {/* Brain Energy™ */}
      <BrainEnergyCard />

      {/* AI Coach CTA — Sprint 3E */}
      <AIMentorCTA studentFirstName={studentFirstName} mindScore={mindScore1000} />
    </div>
  )
}
