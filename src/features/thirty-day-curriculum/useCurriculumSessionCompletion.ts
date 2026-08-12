'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartCompleteHref, isCurriculumSessionCurrentExercise } from './curriculumReturnRouting'

// Immersive Daily Session Playlist™ — the wiring hook for exercises whose
// own completion screen exposes a caller-supplied "Continue"/"Continue
// Session" callback (the Pro Circuit `onComplete` seam, or
// ReadingSessionCompleteScreen's own `onContinue`). `isActiveStep` starts
// false and is only ever flipped true in an effect (never read
// synchronously from sessionStorage during render) — the same
// client-only-read-after-mount convention every localStorage/
// sessionStorage-backed piece of this app already follows, avoiding an
// SSR/hydration mismatch. `advance` is safe to bind directly to a click
// handler (imperative, mutates session storage only when actually
// invoked) but must never be called during render.
export function useCurriculumSessionCompletion(exerciseId: string, fallbackLabHref: string): { isActiveStep: boolean; advance: () => void } {
  const router = useRouter()
  const [isActiveStep, setIsActiveStep] = useState(false)

  useEffect(() => {
    setIsActiveStep(isCurriculumSessionCurrentExercise(exerciseId))
  }, [exerciseId])

  function advance(): void {
    router.push(getCurriculumSmartCompleteHref(exerciseId, fallbackLabHref))
  }

  return { isActiveStep, advance }
}
