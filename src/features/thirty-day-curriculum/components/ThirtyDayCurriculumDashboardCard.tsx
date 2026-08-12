'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TOTAL_CURRICULUM_DAYS, getCurriculumDayTheme } from '../curriculumDatabase'
import { computeConsistencyPercent, getHighestUnlockedDay, loadCurriculumProgress } from '../curriculumProgress'

const CURRICULUM_ROUTE = '/labs/quantum-speed-reading/thirty-day-curriculum'

// Every other dashboard card (TwentyOneDayJourneyCard, MindScoreCard) is
// fed server-fetched props from a Supabase-backed source. This one can't
// be — the 30-Day Curriculum's progress is deliberately client-only
// (localStorage), so this card owns its own client-side load instead,
// same "null until mounted, no fabricated placeholder" convention every
// localStorage-backed hub card in this project already follows.
export function ThirtyDayCurriculumDashboardCard(): React.JSX.Element | null {
  const [nextDay, setNextDay] = useState<number | null>(null)
  const [consistencyPercent, setConsistencyPercent] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const progress = loadCurriculumProgress()
    setHasStarted(progress.completedDays.length > 0)
    setNextDay(getHighestUnlockedDay(progress))
    setConsistencyPercent(computeConsistencyPercent(progress))
  }, [])

  if (nextDay === null) return null

  const theme = getCurriculumDayTheme(nextDay)

  return (
    <Card className="glass-premium-card glass-premium-lift">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" />
              30-Day Quantum Speed Reading Mastery Curriculum™
            </p>
            <h3 className="mt-1 font-heading text-lg font-bold tracking-tight text-foreground">
              {hasStarted ? `Day ${nextDay} — ${theme.title}` : 'Begin Your 30-Day Journey'}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary">
            {consistencyPercent}%
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {hasStarted
            ? theme.focus
            : `A structured, sequentially-unlocked ${TOTAL_CURRICULUM_DAYS}-day roadmap across Brain Gym, Right-Brain, Visualization, and Reading Intelligence.`}
        </p>

        <Button asChild size="sm" className="w-fit rounded-full">
          <Link href={CURRICULUM_ROUTE}>
            {hasStarted ? `Continue Day ${nextDay}` : 'Start Day 1'}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
