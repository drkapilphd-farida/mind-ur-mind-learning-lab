'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { cn } from '@/lib/utils'

type JourneyStatsRowProps = {
  currentStreak: number
  bestStreak: number
  totalXp: number
  readingLevelLabel: string
  lastSessionLabel: string | null
}

type StatItem = {
  emoji: string
  value: string
  label: string
}

// SPRINT-1 — QSR Version-1 Recovery. Surfaces four real, already-computed
// values (streak, XP, Mind Score™ label as "Reading Level", last session)
// that `createReadingIntelligenceExperience().load()` already returns but
// this page never rendered. Deliberately a compact strip, not a second
// stats dashboard — TodaysProgress already owns the one progress ring and
// JourneyHero already owns the one CTA; this only adds the missing at-a-
// glance numbers between them.
export function JourneyStatsRow({ currentStreak, bestStreak, totalXp, readingLevelLabel, lastSessionLabel }: JourneyStatsRowProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedStreak = useCountUp(currentStreak, 700, prefersReducedMotion)
  const animatedXp = useCountUp(totalXp, 700, prefersReducedMotion)

  const items: StatItem[] = [
    {
      emoji: '🔥',
      value: `${Math.round(animatedStreak)}`,
      label: currentStreak > 0 ? `Day Streak · Best ${bestStreak}` : 'Day Streak',
    },
    { emoji: '⚡', value: `${Math.round(animatedXp)}`, label: 'XP' },
    { emoji: '🧠', value: readingLevelLabel, label: 'Reading Level' },
    { emoji: '🕐', value: lastSessionLabel ?? 'No sessions yet', label: 'Last Session' },
  ]

  return (
    <div className="animate-in fade-in grid grid-cols-2 gap-3 duration-(--duration-slow) ease-out sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center rounded-2xl border bg-card px-4 py-5 text-center shadow-sm">
          <p className="text-2xl" aria-hidden="true">{item.emoji}</p>
          <p className={cn('mt-2 font-heading leading-tight font-bold tracking-tight text-foreground', item.value.length > 10 ? 'text-sm' : 'text-lg')}>
            {item.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
