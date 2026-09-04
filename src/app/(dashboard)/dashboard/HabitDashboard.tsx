import { createClient } from '@/lib/supabase/server'
import { hasHabitBuilderAccess } from '@/lib/subscription/hasHabitBuilderAccess'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { GreetingHeading } from '@/components/dashboard/GreetingHeading'
import { TwentyOneDayJourneyCard } from '@/components/dashboard/TwentyOneDayJourneyCard'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { computeDailyQuantumStreak } from '@/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking'
import { getNextJourneyDay } from '@/features/quantum-journey/streakMotivation'

// Domain Split™ — habit.mindurmind.org.in's entire dashboard: the 21-Day
// Quantum Habit Builder journey and its own real streak tracker, nothing
// else. No Document Upload, no 30-Day Masterclass, no Parent Dashboard —
// those routes are actively unreachable from this domain at the
// middleware level (see src/middleware.ts's DOMAIN_ROUTES), not just
// omitted from this page.
export async function HabitDashboard(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

  const [profile, dailyQuantumSessionHistory, isPaidUser] = await Promise.all([
    getCurrentUserProfile(user.id),
    getDailyQuantumSessionHistory(),
    hasHabitBuilderAccess(user.id, user.email ?? null),
  ])

  // The next real 21-Day Journey day (1-21) — daily_quantum_sessions has
  // no persisted "day number" column, so this is simply one past however
  // many real sessions already exist, clamped to the journey's real
  // length (see getNextJourneyDay's own doc comment).
  const nextJourneyDay = getNextJourneyDay(dailyQuantumSessionHistory.length)
  // Streak Counter Mechanism™ — the exact same real computation
  // QuantumJourneySession's own briefing/completion screens already use,
  // reused here rather than a second, parallel streak that could drift.
  const journeyStreak = computeDailyQuantumStreak(dailyQuantumSessionHistory)

  const studentName = profile?.fullName ?? 'there'
  const studentFirstName = studentName.trim().split(' ').at(0) ?? 'there'

  return (
    <div className="glass-premium relative -m-6 space-y-4 p-6 sm:-m-8 sm:space-y-6 sm:p-8">
      {/* Dashboard Glass™ ambient background — see QsrDashboard.tsx's
          identical block for why this is fixed/-z-10/scoped per page. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glass-ambient-blob" style={{ width: 520, height: 520, top: -140, left: -100, background: 'var(--ambient-a)' }} />
        <div className="glass-ambient-blob" style={{ width: 460, height: 460, top: 220, right: -140, background: 'var(--ambient-b)' }} />
        <div className="glass-ambient-blob" style={{ width: 380, height: 380, bottom: -160, left: '35%', background: 'var(--ambient-a)' }} />
      </div>

      <div className="glass-premium-card glass-premium-lift p-6 sm:p-8">
        <GreetingHeading studentName={studentFirstName} />
        <p className="mt-1 text-sm text-muted-foreground">Day {nextJourneyDay} of your 21-Day Quantum Habit Builder.</p>
      </div>

      <TwentyOneDayJourneyCard isPaidUser={isPaidUser} isDevUnlocked={isDevUnlockEnabled()} currentDay={nextJourneyDay} currentStreak={journeyStreak} />
    </div>
  )
}
