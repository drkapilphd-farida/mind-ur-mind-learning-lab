'use client'

import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { VisualAnalyticsSummary } from '../../imageFixation/VisualAnalyticsSummary'
import type { VisualAnalytics } from '../../imageFixation/visualAnalytics'
import { VisualIntelligenceReportBody } from './VisualIntelligenceReportBody'
import type { VisualIntelligenceReport } from '../../actions/completeTratakMissionSession'

type MandalaLevelCompleteScreenProps = {
  levelOrder: number
  xpEarned: number
  completedLevelsCount: number
  totalLevels: number
  analytics: VisualAnalytics | null
  // Sprint 10E: populated whenever Observation Intelligence™ was answered
  // alongside the Analyzer — supersedes the plain analytics/NEI display
  // below with the full Visual Intelligence Report™.
  report: VisualIntelligenceReport | null
  journeyProgressPercent: number
  neuralEvolutionBeforeScore: number
  neuralEvolutionAfterScore: number
  onContinue: () => void
}

export function MandalaLevelCompleteScreen({
  levelOrder,
  xpEarned,
  completedLevelsCount,
  totalLevels,
  analytics,
  report,
  journeyProgressPercent,
  neuralEvolutionBeforeScore,
  neuralEvolutionAfterScore,
  onContinue,
}: MandalaLevelCompleteScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Mandala Tratak™ · Level {levelOrder}</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Focus Strengthened</h1>
        <p className="mt-3 text-sm font-semibold text-foreground">+{xpEarned} XP Earned</p>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Current Mission Progress</p>
        <div className="mt-3 flex gap-1.5" role="img" aria-label={`${completedLevelsCount} of ${totalLevels} levels complete`}>
          {Array.from({ length: totalLevels }, (_, index) => (
            <div key={index} className={cn('h-2.5 flex-1 rounded-full', index < completedLevelsCount ? 'bg-primary' : 'bg-muted')} aria-hidden="true" />
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">
          {completedLevelsCount} / {totalLevels} Levels Complete
        </p>
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

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        Continue Mission
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
