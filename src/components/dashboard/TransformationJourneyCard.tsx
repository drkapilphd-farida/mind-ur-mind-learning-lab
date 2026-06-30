import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDurationLabel } from '@/lib/exercises/practiceHistory'

type DaySnapshot = {
  label: string            // "Yesterday", "Today", "Tomorrow"
  sublabel: string         // e.g. "2 sessions · 4 min" or "Next: Eye Span"
  highlight: boolean       // true for Today
  isEmpty: boolean
}

type TransformationJourneyCardProps = {
  yesterdaySessionCount: number
  yesterdayDurationMs: number
  todaySessionCount: number
  todayDurationMs: number
  nextExerciseTitle: string | null
  nextExerciseHref: string | null
  weeklyActiveDays: number // 0–7
  currentStreak: number
}

export function TransformationJourneyCard({
  yesterdaySessionCount,
  yesterdayDurationMs,
  todaySessionCount,
  todayDurationMs,
  nextExerciseTitle,
  nextExerciseHref,
  weeklyActiveDays,
  currentStreak,
}: TransformationJourneyCardProps): React.JSX.Element {
  function sessionLabel(count: number, ms: number): string {
    if (count === 0) return 'No practice'
    return `${count} session${count !== 1 ? 's' : ''} · ${formatDurationLabel(ms)}`
  }

  const days: DaySnapshot[] = [
    {
      label: 'Yesterday',
      sublabel: sessionLabel(yesterdaySessionCount, yesterdayDurationMs),
      highlight: false,
      isEmpty: yesterdaySessionCount === 0,
    },
    {
      label: 'Today',
      sublabel: todaySessionCount > 0
        ? sessionLabel(todaySessionCount, todayDurationMs)
        : nextExerciseTitle !== null
          ? `Up next: ${nextExerciseTitle}`
          : 'No session yet',
      highlight: true,
      isEmpty: todaySessionCount === 0,
    },
    {
      label: 'Tomorrow',
      sublabel: nextExerciseTitle !== null
        ? `Plan: ${nextExerciseTitle}`
        : 'Module complete',
      highlight: false,
      isEmpty: false,
    },
  ]

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Transformation Journey™
      </p>

      {/* Three-day view */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {days.map((day) => (
          <div
            key={day.label}
            className={cn(
              'rounded-xl p-4',
              day.highlight ? 'bg-foreground/[0.04] ring-1 ring-border' : 'bg-muted/30',
            )}
          >
            <p className={cn('text-xs font-semibold', day.highlight ? 'text-foreground' : 'text-muted-foreground')}>
              {day.label}
            </p>
            <p className={cn('mt-1 text-xs leading-relaxed', day.isEmpty ? 'text-muted-foreground/60' : 'text-muted-foreground')}>
              {day.sublabel}
            </p>
          </div>
        ))}
      </div>

      {/* Journey stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{currentStreak}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Day streak</p>
        </div>
        <div className="rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{weeklyActiveDays}<span className="text-sm font-normal text-muted-foreground">/7</span></p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Days this week</p>
        </div>
        {nextExerciseHref !== null && (
          <div className="col-span-2 sm:col-span-1 flex items-center">
            <Button asChild variant="outline" size="sm" className="w-full gap-1.5 rounded-xl">
              <Link href={nextExerciseHref}>
                Continue journey
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
