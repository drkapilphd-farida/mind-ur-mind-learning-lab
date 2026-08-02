'use client'

import { useCallback, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { FoundationStage } from '../foundationStages'
import { StageIntroScreen } from './StageIntroScreen'
import { GuidedStepScreen } from './GuidedStepScreen'
import { StageCompletionScreen } from './StageCompletionScreen'

type StageExperienceProps = {
  stage: FoundationStage
  isLastStage: boolean
  onContinue: () => void
}

type StageSubPhase = 'intro' | 'guided' | 'complete'

// Sprint-2 (Experience Engine™) — the one reusable per-stage orchestrator,
// replacing Sprint-1's FoundationStagePlaceholder with the exact same
// external contract (stage/isLastStage/onContinue), so the outer
// FoundationJourneyExperience.tsx needs only a one-line swap. Owns its own
// intro -> guided-step(s) -> complete sub-phase; remounts fresh every time
// the outer journey advances to a new stage (the parent's existing
// `key={phase}` wrapper already guarantees this). Only the stage's own
// completion screen calls `onContinue`, advancing the outer journey.
export function StageExperience({ stage, isLastStage, onContinue }: StageExperienceProps): React.JSX.Element {
  const [subPhase, setSubPhase] = useState<StageSubPhase>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleStart = useCallback(() => {
    setSubPhase('guided')
    setStepIndex(0)
  }, [])

  const handleStepContinue = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= stage.guidedSteps.length) {
        setSubPhase('complete')
        return i
      }
      return i + 1
    })
  }, [stage.guidedSteps.length])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''
  const currentStep = stage.guidedSteps[stepIndex]

  return (
    <div key={subPhase === 'guided' ? `guided-${stepIndex}` : subPhase} className={cn(fadeClass)}>
      {subPhase === 'intro' && <StageIntroScreen stage={stage} onStart={handleStart} />}
      {subPhase === 'guided' && currentStep && (
        <GuidedStepScreen
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={stage.guidedSteps.length}
          isLastStep={stepIndex + 1 >= stage.guidedSteps.length}
          onContinue={handleStepContinue}
        />
      )}
      {subPhase === 'complete' && (
        <StageCompletionScreen stage={stage} isLastStage={isLastStage} onContinue={onContinue} />
      )}
    </div>
  )
}
