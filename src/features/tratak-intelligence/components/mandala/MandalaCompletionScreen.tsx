'use client'

import { ArrowRight, Award, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { VisualAnalyticsSummary } from '../../imageFixation/VisualAnalyticsSummary'
import type { VisualAnalytics } from '../../imageFixation/visualAnalytics'
import { VisualIntelligenceReportBody } from './VisualIntelligenceReportBody'
import type { VisualIntelligenceReport } from '../../actions/completeTratakMissionSession'

type MandalaCompletionScreenProps = {
  xpEarned: number
  focusScore: number
  persistenceScore: number
  currentStreak: number
  journeyProgressPercent: number
  neuralEvolutionBeforeScore: number
  neuralEvolutionAfterScore: number
  analytics: VisualAnalytics | null
  // Sprint 10E: populated whenever Observation Intelligence™ was answered
  // for the final level alongside the Analyzer.
  report: VisualIntelligenceReport | null
  onContinueJourney: () => void
  onReturnToJourney: () => void
  // When provided (e.g. embedded inside Visual Activation™, where both
  // buttons below would otherwise do the exact same thing), collapses to
  // one button with this label instead of the standalone route's two.
  continueLabel?: string
}

export function MandalaCompletionScreen({
  xpEarned,
  focusScore,
  persistenceScore,
  currentStreak,
  journeyProgressPercent,
  neuralEvolutionBeforeScore,
  neuralEvolutionAfterScore,
  analytics,
  report,
  onContinueJourney,
  onReturnToJourney,
  continueLabel,
}: MandalaCompletionScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Award className="size-7" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Mandala Tratak™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Visual Fixation Mastered™</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nicely done — you completed all 5 levels of steady visual fixation and inner observation.
        </p>
        <p className="mt-2 text-xs text-muted-foreground/80">
          Your brain just practiced sustained visual fixation — the same focus stamina that keeps your eyes steady during long reading sessions.
        </p>
        <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Mission Badge Earned
        </div>
      </div>

      <div className="flex w-full items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm">
        <ProgressRing
          progress={focusScore / 100}
          size={72}
          label={`${focusScore}`}
          accessibleLabel={`Tratak Focus Score ${focusScore} out of 100`}
        />
        <div className="flex-1 space-y-2 text-left">
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Tratak Focus Score™</p>
            <p className="text-sm font-semibold text-foreground">{focusScore} / 100</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">XP Total</p>
            <p className="text-sm font-semibold text-foreground">+{xpEarned} XP</p>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Persistence Score</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{persistenceScore}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Streak</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{currentStreak}d</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Journey Progress</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{journeyProgressPercent}%</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Neural Evolution (Lab-wide)</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{neuralEvolutionAfterScore}</p>
        </div>
      </div>

      {report !== null ? (
        <VisualIntelligenceReportBody
          report={report}
          xpEarned={xpEarned}
          journeyProgressPercent={journeyProgressPercent}
          neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
          neuralEvolutionAfterScore={neuralEvolutionAfterScore}
        />
      ) : (
        <>
          {analytics !== null && <VisualAnalyticsSummary analytics={analytics} />}
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
            <TrendingUp className="size-3.5 text-primary" aria-hidden="true" />
            Neural Evolution Index™ Updated — {neuralEvolutionAfterScore}
          </div>
        </>
      )}

      <div className="flex w-full flex-col gap-2">
        <Button
          size="lg"
          className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
          onClick={onContinueJourney}
        >
          {continueLabel ?? 'Continue Journey'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        {continueLabel === undefined && (
          <Button variant="outline" size="lg" className="w-full rounded-full" onClick={onReturnToJourney}>
            Return to Journey
          </Button>
        )}
      </div>
    </div>
  )
}
