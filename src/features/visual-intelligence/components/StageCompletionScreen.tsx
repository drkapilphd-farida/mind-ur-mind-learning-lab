'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { FoundationStage } from '../foundationStages'

type StageCompletionScreenProps = {
  stage: FoundationStage
  isLastStage: boolean
  onContinue: () => void
}

// Sprint-2 — this stage's own completion screen (NOT the outer journey's
// FoundationCompletionScreen, which stays untouched). Reuses the same
// nested-circle mark language for visual consistency. Its Continue button
// is the only thing that calls the outer `onContinue`, advancing the
// journey's own phase to the next stage (or overall completion).
export function StageCompletionScreen({ stage, isLastStage, onContinue }: StageCompletionScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12]">
          <div className="size-6 rounded-full bg-primary" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Stage {stage.order} of 5</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{stage.completionTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.completionSubtitle}</p>
      </div>

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        {isLastStage ? 'Finish Journey' : 'Continue'}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
