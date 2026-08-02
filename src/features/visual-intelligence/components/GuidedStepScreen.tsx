'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { GuidedStep } from '../foundationStages'
import { GuidedStepProgress } from './GuidedStepProgress'

type GuidedStepScreenProps = {
  step: GuidedStep
  stepIndex: number
  totalSteps: number
  isLastStep: boolean
  onContinue: () => void
}

// Sprint-2 — one guided step at a time, no exercise logic: this is guidance
// copy only ("here's what this step trains"), never a timed/measured
// activity. StageExperience swaps `step` as the learner advances.
export function GuidedStepScreen({ step, stepIndex, totalSteps, isLastStep, onContinue }: GuidedStepScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <GuidedStepProgress currentIndex={stepIndex} totalSteps={totalSteps} />

      <div
        className={cn('flex size-16 items-center justify-center rounded-full bg-primary/[0.08]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="size-3 rounded-full bg-primary" />
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {totalSteps > 1 ? `Step ${stepIndex + 1} of ${totalSteps}` : 'Guided Step'}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{step.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </div>

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        Continue
        {!isLastStep && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </div>
  )
}
