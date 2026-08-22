import Link from 'next/link'
import { Check, FlaskConical, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK } from '@/config/quantumMindsetHabitBuilderPaymentLink'

type TwentyOneDayJourneyCardProps = {
  isPaidUser: boolean
  // Dev/Test Mode™ — a separate flag from isPaidUser, so an unlocked view
  // here is never mistaken for a real subscription: see
  // isDevUnlockEnabled's own doc comment for what turns this on.
  isDevUnlocked: boolean
  // The next real day to complete (1-21) — getNextJourneyDay(sessionCount)
  // from streakMotivation.ts, the same value StreakReminderBanner's own
  // "Day N is waiting for you" CTA already used.
  currentDay: number
}

const TOTAL_DAYS = 21

// 21-Day Journey Paywall™ — a fixed free window, not tied to progress:
// Days 1-7 (the full first week) are free for every user; Day 8 onward
// requires Pro, even if it's the learner's own "next" day. Mirrors the
// exact same FREE_JOURNEY_DAYS threshold enforced server-side in
// journey/[day]/page.tsx — this component's own lock styling is a UI
// convenience matching that real boundary, not a separate rule of its
// own that could drift out of sync.
const FREE_JOURNEY_DAYS = 7

function journeyDayHref(day: number): string {
  return `/labs/quantum-speed-reading/journey/${day}`
}

// Quantum Mindset & Habit Builder™ — every day (1-21) launches
// the real QuantumJourneySession (see src/features/quantum-journey/), a
// guided 4-level session chaining a real Reading Intelligence, Intuition
// Development, Right Brain Activation, and Visualisation exercise (which
// exact exercises per day is QuantumJourneySession's own, real, deterministic
// day-parity rotation — never fabricated). Locked days (Day 8+ for a
// free user) are real links straight to the Razorpay one-time payment
// link, not dead ends — tapping one is exactly how a free user is meant
// to discover the upgrade. Opened in a new tab (external checkout,
// target="_blank") so the dashboard itself is never navigated away from.
export function TwentyOneDayJourneyCard({ isPaidUser, isDevUnlocked, currentDay }: TwentyOneDayJourneyCardProps): React.JSX.Element {
  const otherDays = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((day) => day !== currentDay)
  const hasProAccess = isPaidUser || isDevUnlocked
  const isDayUnlocked = (day: number): boolean => day <= FREE_JOURNEY_DAYS || hasProAccess
  const isReplay = currentDay > 1
  const isCurrentDayUnlocked = isDayUnlocked(currentDay)

  return (
    <div className="glass-premium-card glass-premium-lift glass-tier-masterclass p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex w-fit items-center rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-400">
            Tier 2 · Structured Program
          </span>
          <h2 className="mt-2 font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Quantum Mindset &amp; Habit Builder™
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!hasProAccess && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-2.5" aria-hidden="true" />
              Free through Day {FREE_JOURNEY_DAYS} — Pro unlocks the rest
            </Badge>
          )}
          {isDevUnlocked && !isPaidUser && (
            <Badge variant="outline" className="gap-1 border-warning/30 text-warning">
              <FlaskConical className="size-2.5" aria-hidden="true" />
              Dev Unlock — all days open for testing
            </Badge>
          )}
        </div>
      </div>

      {isCurrentDayUnlocked ? (
        <Link
          href={journeyDayHref(currentDay)}
          className="mt-4 flex items-center gap-4 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.02] p-4 transition-colors hover:bg-indigo-500/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20">
            {currentDay}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Day {currentDay}</p>
            <p className="truncate text-xs text-slate-700 dark:text-slate-300">Reading · Intuition · Right Brain · Visualisation</p>
          </div>
          <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-indigo-500 hover:to-indigo-400 active:scale-95">
            {isReplay ? 'Continue →' : 'Begin →'}
          </span>
        </Link>
      ) : (
        <a
          href={RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-4 rounded-xl border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 text-sm font-semibold text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Day {currentDay}</p>
            <p className="truncate text-xs text-slate-700 dark:text-slate-300">Upgrade to Pro to unlock this day</p>
          </div>
          <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-indigo-500 hover:to-indigo-400 active:scale-95">
            Upgrade →
          </span>
        </a>
      )}

      <div className="mt-4 grid grid-cols-10 gap-2 sm:grid-cols-10">
        {otherDays.map((day) => {
          const unlocked = isDayUnlocked(day)
          const isCompleted = unlocked && day < currentDay

          if (isCompleted) {
            return (
              <Link
                key={day}
                href={journeyDayHref(day)}
                aria-label={`Day ${day}, completed`}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 shadow-[0_0_8px_-3px_rgba(16,185,129,0.5)] transition-colors duration-200 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:text-emerald-400"
              >
                <Check className="size-2.5" aria-hidden="true" />
              </Link>
            )
          }

          return unlocked ? (
            <Link
              key={day}
              href={journeyDayHref(day)}
              aria-label={`Day ${day}, unlocked`}
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-slate-200/80 bg-foreground/[0.02] text-[11px] font-medium text-muted-foreground transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-slate-800/80"
            >
              {day}
            </Link>
          ) : (
            // Locked days are real links straight to the Razorpay
            // one-time payment link, not dead <div>s — clicking a locked
            // day is a real upgrade entry point, exactly how a free user
            // is meant to discover the upgrade. Opened in a new tab so
            // the dashboard stays put behind the checkout.
            <a
              key={day}
              href={RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Day ${day}, locked, upgrade to Pro`}
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-slate-200/60 bg-muted/40 text-[11px] font-medium text-muted-foreground/50 transition-colors hover:bg-muted/60 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-slate-800/60"
            >
              <Lock className="size-2.5" aria-hidden="true" />
              {day}
            </a>
          )
        })}
      </div>
    </div>
  )
}
