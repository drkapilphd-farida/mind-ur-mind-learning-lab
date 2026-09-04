import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { QuantumJourneySession } from '@/features/quantum-journey/components/QuantumJourneySession'
import { TOTAL_JOURNEY_DAYS } from '@/features/quantum-journey/quantumJourneyLevels'
import { getWeakestDomain } from '@/features/quantum-journey/queries/getWeakestDomain'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { computeDailyQuantumStreak } from '@/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking'
import { getBaselineSession } from '@/features/quantum-journey/adaptivePacing'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { hasHabitBuilderAccess } from '@/lib/subscription/hasHabitBuilderAccess'
import { RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK } from '@/config/quantumMindsetHabitBuilderPaymentLink'

// 21-Day Journey Paywall™ — Days 1 through 7 (the full first week) are
// free for every user (the real "try it for real, not a demo" window);
// Day 8 onward requires an active Pro subscription. A fixed threshold,
// not tied to `currentDay`/progress — a free user's own "next" day past
// Day 7 is still locked, not just days they haven't reached yet.
const FREE_JOURNEY_DAYS = 7

export const metadata: Metadata = {
  title: 'Quantum Mindset & Habit Builder™',
  description: 'An adaptive, week-by-week guided daily session across Reading, Intuition, Right Brain, and Visualisation.',
}

type QuantumJourneyDayPageProps = { params: Promise<{ day: string }> }

// 21-Day Transformation Journey™ — validates the day segment server-side
// (1-21 only) before ever mounting the real session, so a malformed or
// out-of-range URL 404s honestly instead of handing an invalid day
// number to the client orchestrator. Also resolves the two real adaptive
// signals here, server-side, before the wizard ever renders: Smart
// Weakness Targeting™ (getWeakestDomain) and Auto-Pacing (the most
// recent reading sprint's own accuracy) — both real queries over
// already-persisted data, never client-computed guesses.
export default async function QuantumJourneyDayPage({ params }: QuantumJourneyDayPageProps): Promise<React.JSX.Element> {
  const { day } = await params
  const dayNumber = Number(day)

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > TOTAL_JOURNEY_DAYS) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 21-Day Journey Paywall™ — checked before anything else below: no
  // point resolving weakest-domain/streak/baseline data for a session the
  // user isn't allowed to start. Locked days go straight to the real
  // Razorpay one-time payment link (RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK),
  // not the general /pricing page — same "one real checkout URL" pattern
  // the 30-Day Masterclass's own paywall already uses.
  if (dayNumber > FREE_JOURNEY_DAYS && !isDevUnlockEnabled()) {
    const hasAccess = user ? await hasHabitBuilderAccess(user.id, user.email ?? null) : false
    if (!hasAccess) {
      redirect(RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK)
    }
  }

  const [weakestDomain, readingHistory, baselineDiagnostic] = await Promise.all([
    getWeakestDomain(),
    getDailyQuantumSessionHistory(),
    getBaselineDiagnostic(),
  ])

  // Mandatory 30-Second Baseline Speed & Comprehension Diagnostic™ — a
  // brand-new user (no real journey history yet, no diagnostic on file)
  // must complete it before ever reaching Day 1. Existing users who
  // started their journey before this diagnostic existed are never
  // retroactively blocked (readingHistory.length > 0 already proves they
  // have a real session). Dev/Test Mode™ bypasses this gate the same way
  // it bypasses every other sequential lock in the platform.
  if (dayNumber === 1 && baselineDiagnostic === null && readingHistory.length === 0 && !isDevUnlockEnabled()) {
    redirect('/labs/quantum-speed-reading/journey/baseline-diagnostic')
  }

  const previousReadingAccuracyPercent = readingHistory[0]?.accuracyPercent ?? null
  const currentStreak = computeDailyQuantumStreak(readingHistory)
  // Baseline Test™ — the mandatory pre-Day-1 diagnostic is now the
  // authoritative baseline reference whenever it exists; Day 1's first
  // real sprint remains the fallback baseline only for users who started
  // their journey before this diagnostic existed (see getBaselineSession's
  // own comment).
  const baselineWpm = baselineDiagnostic?.trueBaselineWpm ?? getBaselineSession(readingHistory)?.readingWpm ?? null
  const isBaselineDay = baselineDiagnostic === null && readingHistory.length === 0

  // Pre-Session AI Coach Welcome & Briefing™ — real facts about the
  // user's own last session, resolved here server-side so the briefing
  // screen never has to guess. daysSinceLastSession is a genuine day
  // count (never assumed to be "yesterday") — see
  // preSessionBriefingPrompt.ts's own comment on why that distinction
  // matters.
  const previousReadingWpm = readingHistory[0]?.readingWpm ?? null
  const daysSinceLastSession =
    readingHistory[0] !== undefined ? Math.floor((Date.now() - new Date(readingHistory[0].occurredAt).getTime()) / 86_400_000) : null

  const profile = user ? await getCurrentUserProfile(user.id) : null
  const studentName = profile?.fullName ?? 'there'
  const studentFirstName = studentName.trim().split(' ').at(0) ?? 'there'

  return (
    <Suspense>
      <QuantumJourneySession
        day={dayNumber}
        weakestDomain={weakestDomain}
        previousReadingAccuracyPercent={previousReadingAccuracyPercent}
        currentStreak={currentStreak}
        baselineWpm={baselineWpm}
        isBaselineDay={isBaselineDay}
        studentFirstName={studentFirstName}
        previousReadingWpm={previousReadingWpm}
        daysSinceLastSession={daysSinceLastSession}
      />
    </Suspense>
  )
}
