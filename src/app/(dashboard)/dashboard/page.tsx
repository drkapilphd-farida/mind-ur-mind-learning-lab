import { Suspense } from 'react'
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
import { computeMemoryScore } from '@/lib/exercises/mindScore'
import { GreetingHeading } from '@/components/dashboard/GreetingHeading'
import { AIMentorSection, AIMentorSkeleton } from '@/components/dashboard/AIMentorSection'
import { MindScoreCard } from '@/components/dashboard/MindScoreCard'
import { AIDocumentTransformerWidget } from '@/components/dashboard/AIDocumentTransformerWidget'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { getQuantumDocumentHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentHistory'
import { getQuantumDocumentSessionHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentSessionHistory'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getFixationStats } from '@/features/visual-intelligence/fixation/queries/getFixationStats'
import { TwentyOneDayJourneyCard } from '@/components/dashboard/TwentyOneDayJourneyCard'
import { ThirtyDayCurriculumDashboardCard } from '@/features/thirty-day-curriculum/components/ThirtyDayCurriculumDashboardCard'
import { LiveMasterclassBannerCard } from '@/components/dashboard/LiveMasterclassBannerCard'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { getLiveMasterclassWaitlistStatus } from '@/app/unified-quantum-session-preview/actions/getLiveMasterclassWaitlistStatus'
import { getNextJourneyDay } from '@/features/quantum-journey/streakMotivation'
import { ParentFeedbackPrompt } from '@/features/school-dashboard/components/ParentFeedbackPrompt'

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
    recentQuantumDocuments,
    quantumDocumentSessionHistory,
    fixationSessions,
    hasJoinedLiveMasterclassWaitlist,
  ] = await Promise.all([
    getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
    getCurrentUserProfile(user.id),
    getDailyQuantumSessionHistory(),
    getIsPaidUser(user.id),
    getQuantumDocumentCount(user.id),
    getQuantumDocumentHistory(),
    getQuantumDocumentSessionHistory(),
    getFixationSessions(),
    getLiveMasterclassWaitlistStatus(),
  ])

  // The next real 21-Day Journey day (1-21) — daily_quantum_sessions has
  // no persisted "day number" column, so this is simply one past however
  // many real sessions already exist, clamped to the journey's real
  // length (see getNextJourneyDay's own doc comment).
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
      </div>

      {/* Live Masterclass™ — a premium upsell banner, deliberately its own
          standalone card rather than a second competing CTA crammed into
          the Hero — the Hero's own daily-practice momentum (AI Mentor,
          streak) stays uninterrupted, and the dashboard's one daily-habit
          CTA is the 21-Day Journey card below, not this. Reuses the exact
          same real waitlist mechanism the QSR Pro Circuit's completion
          screen already uses (joinLiveMasterclassWaitlist/
          getLiveMasterclassWaitlistStatus, live_masterclass_waitlist
          table) — no new backend, no fake registration flow. */}
      <LiveMasterclassBannerCard initialHasJoined={hasJoinedLiveMasterclassWaitlist} />

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

      {/* 21-Day Transformation Journey™ — above Mind Score to prioritize
          daily habit progression. */}
      <TwentyOneDayJourneyCard isPaidUser={isPaidUser} isDevUnlocked={isDevUnlockEnabled()} currentDay={nextJourneyDay} />

      {/* 30-Day Quantum Speed Reading Mastery Curriculum™ — a separate,
          longer-form structured roadmap sitting alongside the 21-Day
          Journey rather than replacing it; client-only progress (see the
          card's own doc comment), so it renders nothing until mounted. */}
      <ThirtyDayCurriculumDashboardCard />

      {/* Mind Score™ */}
      <MindScoreCard
        mindScore={mindScore}
        readingScore={completionPercent}
        memoryScore={memoryScore}
        focusScore={focusScore}
      />

      {/* Parent NPS™ — last on the page, deliberately low-priority
          placement for a "non-intrusive" prompt; renders nothing for
          the common case (no tenant membership) or for tenant staff. */}
      <ParentFeedbackPrompt />
    </div>
  )
}
