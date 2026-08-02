'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { cn } from '@/lib/utils'
import type { FoundationStage } from '../../foundationStages'
import type { LibraryImage } from '../../image-persistence/imageLibrary'
import type { ObservationResponse } from '../../image-persistence/imagePersistenceTypes'
import { saveImagePersistenceSession } from '../../image-persistence/actions/saveImagePersistenceSession'
import { ImagePersistenceIntro } from './ImagePersistenceIntro'
import { ImagePersistenceReady } from './ImagePersistenceReady'
import { ImagePersistenceSession } from './ImagePersistenceSession'
import { ImagePersistenceCloseEyes } from './ImagePersistenceCloseEyes'
import { ImagePersistenceObservation } from './ImagePersistenceObservation'
import { ImagePersistenceCompletion } from './ImagePersistenceCompletion'

type ImagePersistenceExperienceProps = {
  stage: FoundationStage
  image: LibraryImage
  cycleIndex: number
  onContinue: () => void
}

type ImagePersistencePhase = 'intro' | 'ready' | 'countdown' | 'session' | 'close-eyes' | 'observation' | 'complete'

// Sprint-3B — the bespoke Image Persistence Challenge™ engine. Same phase
// machine and timer as Sprint-3A; only the image data (now a full
// LibraryImage from the categorized registry, chosen via rotation) and the
// screens' presentation are upgraded. Same external contract
// (stage/onContinue) so FoundationJourneyExperience.tsx's conditional
// branch needed no logic change.
export function ImagePersistenceExperience({
  stage,
  image,
  cycleIndex,
  onContinue,
}: ImagePersistenceExperienceProps): React.JSX.Element {
  const [phase, setPhase] = useState<ImagePersistencePhase>('intro')
  const [observationResponse, setObservationResponse] = useState<ObservationResponse | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const handleStart = useCallback(() => setPhase('ready'), [])
  const handleBeginSession = useCallback(() => setPhase('countdown'), [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('close-eyes'), [])
  const handleCloseEyesContinue = useCallback(() => setPhase('observation'), [])
  const handleObservationSubmit = useCallback((response: ObservationResponse | null, submittedNotes: string | null) => {
    setObservationResponse(response)
    setNotes(submittedNotes)
    setPhase('complete')
  }, [])

  // Fires exactly once when the completion screen is reached — same
  // notifiedRef-guard convention ComprehensionQuizExperience.tsx already
  // uses for its own once-per-completion save. Saves the image's stable
  // registry id (e.g. "nature-1"), not a raw filename.
  useEffect(() => {
    if (phase !== 'complete' || hasSavedRef.current) return
    hasSavedRef.current = true
    void saveImagePersistenceSession({
      imageUsed: image.id,
      durationSeconds: image.duration,
      observationResponse,
      notes,
    })
  }, [phase, image.id, image.duration, observationResponse, notes])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div key={phase} className={cn(fadeClass)}>
      {/* Sprint-3B — invisible preload, rendered from the very first phase
          so the browser starts fetching image.filePath up to a minute
          before the session screen actually needs it. Zero loading flash,
          zero layout shift, since this reserves no visible space. */}
      <div className="sr-only" aria-hidden="true">
        <Image src={image.filePath} alt="" width={1} height={1} priority />
      </div>

      {phase === 'intro' && <ImagePersistenceIntro stage={stage} onStart={handleStart} />}
      {phase === 'ready' && <ImagePersistenceReady image={image} onBegin={handleBeginSession} />}
      {phase === 'countdown' && (
        <div className="flex justify-center">
          {/* Soft sound placeholder — a gentle chime would play here in a
              future sprint once real audio assets exist; no audio infra
              exists anywhere in this codebase yet, so nothing is faked. */}
          <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Begin" />
        </div>
      )}
      {phase === 'session' && <ImagePersistenceSession image={image} onComplete={handleSessionComplete} />}
      {phase === 'close-eyes' && <ImagePersistenceCloseEyes onContinue={handleCloseEyesContinue} />}
      {phase === 'observation' && <ImagePersistenceObservation onSubmit={handleObservationSubmit} />}
      {phase === 'complete' && (
        <ImagePersistenceCompletion image={image} cycleIndex={cycleIndex} onContinue={onContinue} />
      )}
    </div>
  )
}
