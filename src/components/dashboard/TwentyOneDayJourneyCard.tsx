import Link from 'next/link'
import { FlaskConical, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type TwentyOneDayJourneyCardProps = {
  isPaidUser: boolean
  // Dev/Test Mode™ — a separate flag from isPaidUser, so an unlocked view
  // here is never mistaken for a real subscription: see
  // isDevUnlockEnabled's own doc comment for what turns this on.
  isDevUnlocked: boolean
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
// day-parity rotation — never fabricated). Day 1 is always open; Days 2-21
// are gated by real (if currently always-free) subscription state from
// getIsPaidUser, or the dev/test bypass — locked days show only their
// number, never a fabricated preview of that day's content.
export function TwentyOneDayJourneyCard({ isPaidUser, isDevUnlocked }: TwentyOneDayJourneyCardProps): React.JSX.Element {
  const remainingDays = Array.from({ length: TOTAL_DAYS - 1 }, (_, i) => i + 2)
  const isUnlocked = isPaidUser || isDevUnlocked

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">21-Day Transformation Journey™</p>
        {!isUnlocked && (
          <Badge variant="secondary" className="gap-1">
            <Lock className="size-2.5" aria-hidden="true" />
            Pro unlocks Days 2–21
          </Badge>
        )}
        {isDevUnlocked && !isPaidUser && (
          <Badge variant="outline" className="gap-1 border-warning/30 text-warning">
            <FlaskConical className="size-2.5" aria-hidden="true" />
            Dev Unlock — Days 2–21 open for testing
          </Badge>
        )}
      </div>

      <Link
        href={journeyDayHref(1)}
        className="mt-4 flex items-center gap-4 rounded-xl border bg-foreground/[0.02] p-4 transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          1
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Day 1</p>
          <p className="truncate text-xs text-muted-foreground">Reading · Intuition · Right Brain · Visualisation</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-primary">Begin →</span>
      </Link>

      <div className="mt-4 grid grid-cols-10 gap-2 sm:grid-cols-10">
        {remainingDays.map((day) =>
          isUnlocked ? (
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
          ),
        )}
      </div>
    </div>
  )
}
