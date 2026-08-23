'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurriculumDayTheme } from '@/features/thirty-day-curriculum/curriculumDatabase'
import {
  computeConsistencyPercent,
  computeDailyCurriculumStreak,
  getHighestUnlockedDay,
  loadCurriculumProgress,
} from '@/features/thirty-day-curriculum/curriculumProgress'

const CURRICULUM_ROUTE = '/labs/quantum-speed-reading/thirty-day-curriculum'

// Member-Exclusive Simplification™ — this used to also carry the ₹4,999
// enrollment CTA, a WhatsApp promo banner, and a reviews link. All
// sales/enrollment copy now lives only wherever eventually becomes the
// public landing page (out of scope here) — this card, shown to
// already-signed-in members on their own dashboard, is now purely their
// own real 30-Day Masterclass progress and a direct way back into
// today's mission.
export function ThirtyDayMasterclassHeroCard(): React.JSX.Element {
  const [nextDay, setNextDay] = useState<number | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [consistencyPercent, setConsistencyPercent] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)

  useEffect(() => {
    const progress = loadCurriculumProgress()
    setHasStarted(progress.completedDays.length > 0)
    setNextDay(getHighestUnlockedDay(progress))
    setConsistencyPercent(computeConsistencyPercent(progress))
    setCurrentStreak(computeDailyCurriculumStreak(progress))
  }, [])

  const theme = nextDay !== null ? getCurriculumDayTheme(nextDay) : null

  return (
    <div
      className="glass-premium-card glass-premium-lift glass-tier-flagship relative overflow-hidden p-6 sm:p-8"
      data-hero-card="thirty-day-masterclass"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-14 size-64 rounded-full bg-emerald-400/[0.06] blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md">
            <GraduationCap className="size-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                30-Day Masterclass
              </span>
              {currentStreak > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400"
                  data-streak-badge="true"
                >
                  <Flame className="size-2.5" aria-hidden="true" />
                  Current Streak: {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">⚡ 30-Day Quantum Speed Reading Mastery™</h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Your Curriculum Progress</p>
            <p className="mt-0.5 text-sm font-medium text-foreground" data-curriculum-status={hasStarted ? 'in-progress' : 'not-started'}>
              {nextDay === null ? 'Loading…' : hasStarted && theme !== null ? `Day ${nextDay} — ${theme.title}` : 'Ready to begin Day 1'}
            </p>
            {hasStarted && <p className="text-xs text-muted-foreground">{consistencyPercent}% of the 30 days complete</p>}
          </div>
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 sm:w-auto"
          >
            <Link href={CURRICULUM_ROUTE}>{nextDay === null ? 'Open Curriculum' : hasStarted ? `Continue Day ${nextDay}` : 'Start Day 1'}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
