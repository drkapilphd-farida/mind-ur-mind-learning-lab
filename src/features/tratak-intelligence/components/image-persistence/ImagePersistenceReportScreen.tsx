'use client'

import { Images, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { DailyPersistenceReport } from '../../dailyPersistenceReport'

type ImagePersistenceReportScreenProps = {
  dailyReport: DailyPersistenceReport
  // Real, already-computed lab-wide Visual DNA™ score (context.scoreProgress.currentScore)
  // — Tratak doesn't feed Visual DNA™, so this is the honest existing value, never fabricated.
  visualDnaScore: number
  neuralEvolutionBeforeScore: number
  neuralEvolutionAfterScore: number
  dailyStreak: number
  onReturnToJourney: () => void
  // Cosmetic only — defaults to this screen's exact current copy.
  continueLabel?: string
}

// Sprint 10F architecture refinement: ONE combined report after all 5
// images (never one per image). Shows exactly the 8 items the brief
// specifies — Today's Persistence Score™, Observation Accuracy™, Fixation
// Stability™, Visual Recall™, Visual DNA™, Neural Evolution Index™, XP
// Earned, Daily Streak — every number a real average/sum/lab-wide read,
// nothing fabricated.
export function ImagePersistenceReportScreen({
  dailyReport,
  visualDnaScore,
  neuralEvolutionBeforeScore,
  neuralEvolutionAfterScore,
  dailyStreak,
  onReturnToJourney,
  continueLabel = 'Return to Journey',
}: ImagePersistenceReportScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const neuralEvolutionDelta = neuralEvolutionAfterScore - neuralEvolutionBeforeScore
  const deltaLabel = `${neuralEvolutionDelta >= 0 ? '+' : ''}${neuralEvolutionDelta}`

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Images className="size-6" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Image Persistence Challenge™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Visual Recall Strengthened</h1>
        <p className="mt-3 text-sm text-muted-foreground">Come back tomorrow for a fresh set of images.</p>
        <p className="mt-2 text-xs text-muted-foreground/80">
          You practiced visual recall — holding an image in mind after it disappears, the same skill that lets your eyes stay ahead of the words you&rsquo;re reading.
        </p>
      </div>

      <div className="w-full rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Today&rsquo;s Persistence Score™</p>
        <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{dailyReport.todaysPersistenceScore}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Average across all 5 of today&rsquo;s images</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-base font-semibold text-foreground">{dailyReport.observationAccuracy}%</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Observation Accuracy™</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-base font-semibold text-foreground">{dailyReport.fixationStability}%</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Fixation Stability™</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-base font-semibold text-foreground">{dailyReport.visualRecall}%</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Visual Recall™</p>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual DNA™</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{visualDnaScore}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">XP Earned</p>
          <p className="mt-1 text-lg font-semibold text-foreground">+{dailyReport.xpEarnedToday}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Daily Streak</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{dailyStreak}d</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Neural Evolution™</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{neuralEvolutionAfterScore}</p>
        </div>
      </div>

      <div className="flex w-full items-center gap-2 rounded-2xl bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
        <TrendingUp className="size-3.5 text-primary" aria-hidden="true" />
        Neural Evolution Index™ {deltaLabel} — now {neuralEvolutionAfterScore}
      </div>

      <div className="flex w-full items-start gap-2 rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-left text-xs leading-relaxed text-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <p>{dailyReport.recommendation}</p>
      </div>

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onReturnToJourney}
      >
        {continueLabel}
      </Button>
    </div>
  )
}
