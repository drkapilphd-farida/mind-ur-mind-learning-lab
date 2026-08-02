'use client'

import { useCallback, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FOUNDATION_JOURNEY_STAGES } from '../foundationStages'
import { FoundationProgressIndicator } from './FoundationProgressIndicator'
import { StageExperience } from './StageExperience'
import { FoundationCompletionScreen } from './FoundationCompletionScreen'
import { ImagePersistenceExperience } from './image-persistence/ImagePersistenceExperience'
import type { LibraryImage } from '../image-persistence/imageLibrary'

type JourneyPhase = 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4' | 'stage-5' | 'complete'

const PHASE_ORDER: readonly JourneyPhase[] = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'complete']

// "Ready for Reading Intelligence Lab™" is the completion copy's own
// promise — Continue goes forward into the real, already-shipped lab
// rather than looping back to this journey's own home screen. No query
// params, no gating integration: a plain link, matching this sprint's
// "architecture + UI only" scope.
const READING_LAB_HREF = '/labs/quantum-speed-reading'

type FoundationJourneyExperienceProps = {
  // Sprint-3B — the one image (now with rich category metadata, chosen via
  // rotation, not plain random) picked server-side (journey/page.tsx)
  // before Stage 3 can render. Additive prop only; every other stage
  // ignores it.
  imagePersistence: {
    image: LibraryImage
    cycleIndex: number
  }
}

// The one client "brain" of the Foundation Journey™ — owns phase state and
// swaps which stage placeholder (or the completion screen) is shown.
// Continue advances phase state in place; nothing here navigates between
// stages, which is what makes this "one continuous experience" literal.
export function FoundationJourneyExperience({ imagePersistence }: FoundationJourneyExperienceProps): React.JSX.Element {
  const [phase, setPhase] = useState<JourneyPhase>('stage-1')
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleContinue = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    setPhase(PHASE_ORDER[idx + 1] ?? 'complete')
  }, [phase])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''
  const currentStageIndex = PHASE_ORDER.indexOf(phase)
  const currentOrder = phase === 'complete' ? null : ((currentStageIndex + 1) as 1 | 2 | 3 | 4 | 5)
  const currentStage = currentOrder !== null ? FOUNDATION_JOURNEY_STAGES.find((s) => s.order === currentOrder) : undefined

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center gap-10 px-6 py-16">
      {phase !== 'complete' && <FoundationProgressIndicator currentOrder={currentOrder} />}

      <div key={phase} className={cn(fadeClass)}>
        {phase === 'complete' || !currentStage ? (
          <FoundationCompletionScreen continueHref={READING_LAB_HREF} />
        ) : currentStage.id === 'image-persistence' ? (
          <ImagePersistenceExperience
            stage={currentStage}
            image={imagePersistence.image}
            cycleIndex={imagePersistence.cycleIndex}
            onContinue={handleContinue}
          />
        ) : (
          <StageExperience
            stage={currentStage}
            isLastStage={currentStage.order === 5}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  )
}
