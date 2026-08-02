'use client'

import { ArrowRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { VisualIntelligenceReportBody } from '../mandala/VisualIntelligenceReportBody'
import type { VisualIntelligenceReport } from '../../actions/completeTratakMissionSession'

type CandleTratakReportScreenProps = {
  report: VisualIntelligenceReport
  xpEarned: number
  journeyProgressPercent: number
  neuralEvolutionBeforeScore: number
  neuralEvolutionAfterScore: number
  onPracticeAgain: () => void
  onReturnToJourney: () => void
  // Cosmetic only — defaults to this screen's exact current copy.
  continueLabel?: string
}

// Reuses VisualIntelligenceReportBody verbatim (kept in components/mandala/,
// see plan note) — single-shot mission, no extra composite tile.
export function CandleTratakReportScreen({
  report,
  xpEarned,
  journeyProgressPercent,
  neuralEvolutionBeforeScore,
  neuralEvolutionAfterScore,
  onPracticeAgain,
  onReturnToJourney,
  continueLabel = 'Return to Journey',
}: CandleTratakReportScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Flame className="size-6" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Candle Tratak™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Visual Persistence Strengthened™</h1>
        <p className="mt-3 text-sm font-semibold text-foreground">+{xpEarned} XP Earned</p>
        <p className="mt-2 text-xs text-muted-foreground/80">
          You trained visual persistence — holding a clear image after it disappears, a skill that helps your eyes keep pace with fast reading.
        </p>
      </div>

      <VisualIntelligenceReportBody
        report={report}
        xpEarned={xpEarned}
        journeyProgressPercent={journeyProgressPercent}
        neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
        neuralEvolutionAfterScore={neuralEvolutionAfterScore}
      />

      <div className="flex w-full flex-col gap-2">
        <Button
          size="lg"
          className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
          onClick={onPracticeAgain}
        >
          Retry Mission™
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="lg" className="w-full rounded-full" onClick={onReturnToJourney}>
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}
