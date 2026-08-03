import Link from 'next/link'
import { Check, FlaskConical, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type TwentyOneDayJourneyCardProps = {
  isPaidUser: boolean
  // Dev/Test Mode™ — a separate flag from isPaidUser, so an unlocked view
  // here is never mistaken for a real subscription: see
  // isDevUnlockEnabled's own doc comment for what turns this on.
  isDevUnlocked: boolean
  // The next real day to complete (1-21) — getNextJourneyDay(sessionCount)
  // from streakMotivation.ts, the same value StreakReminderBanner's own
  // "Day N is waiting for you" CTA already used. Previously this card
  // hardcoded "Day 1" regardless of real progress.
  currentDay: number
}

const TOTAL_DAYS = 21

function journeyDayHref(day: number): string {
  return `/labs/quantum-speed-reading/journey/${day}`
}

// 21-Day Transformation Journey™ — every day (1-21) launches the real
// QuantumJourneySession (see src/features/quantum-journey/), a guided
// 4-level session chaining a real Reading Intelligence, Intuition
// Development, Right Brain Activation, and Visualisation exercise (which
// exact exercises per day is QuantumJourneySession's own, real, deterministic
// day-parity rotation — never fabricated). `currentDay` is always the
// featured, always-open row; days before it show as completed (never
// re-locked, even for a free user); days after it are gated by real (if
// currently always-free) subscription state from getIsPaidUser, or the
// dev/test bypass — locked days show only their number, never a
// fabricated preview of that day's content.
export function TwentyOneDayJourneyCard({ isPaidUser, isDevUnlocked, currentDay }: TwentyOneDayJourneyCardProps): React.JSX.Element {
  const otherDays = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((day) => day !== currentDay)
  const isUnlocked = isPaidUser || isDevUnlocked
  const isReplay = currentDay > 1

  return (
    <div className="glass-premium-card glass-premium-lift p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">21-Day Transformation Journey™</p>
        {!isUnlocked && (
          <Badge variant="secondary" className="gap-1">
            <Lock className="size-2.5" aria-hidden="true" />
            Pro unlocks remaining days
          </Badge>
        )}
        {isDevUnlocked && !isPaidUser && (
          <Badge variant="outline" className="gap-1 border-warning/30 text-warning">
            <FlaskConical className="size-2.5" aria-hidden="true" />
            Dev Unlock — all days open for testing
          </Badge>
        )}
      </div>

      <Link
        href={journeyDayHref(currentDay)}
        className="mt-4 flex items-center gap-4 rounded-xl border bg-foreground/[0.02] p-4 transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {currentDay}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Day {currentDay}</p>
          <p className="truncate text-xs text-muted-foreground">Reading · Intuition · Right Brain · Visualisation</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-primary">{isReplay ? 'Continue →' : 'Begin →'}</span>
      </Link>

      <div className="mt-4 grid grid-cols-10 gap-2 sm:grid-cols-10">
        {otherDays.map((day) => {
          if (day < currentDay) {
            return (
              <Link
                key={day}
                href={journeyDayHref(day)}
                aria-label={`Day ${day}, completed`}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-success/30 bg-success/10 text-[11px] font-medium text-success transition-colors hover:bg-success/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Check className="size-2.5" aria-hidden="true" />
              </Link>
            )
          }

          return isUnlocked ? (
            <Link
              key={day}
              href={journeyDayHref(day)}
              aria-label={`Day ${day}, unlocked`}
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-foreground/[0.02] text-[11px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {day}
            </Link>
          ) : (
            <div
              key={day}
              aria-label={`Day ${day}, locked, Pro`}
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 text-[11px] font-medium text-muted-foreground/50"
            >
              <Lock className="size-2.5" aria-hidden="true" />
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
