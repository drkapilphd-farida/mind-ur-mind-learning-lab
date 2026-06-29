'use client'

import { useState } from 'react'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import type { LabId } from '@/lib/exercises/types'

export type ExerciseSessionStage = 'intro' | 'active' | 'completion'

type UseExerciseSessionOptions = {
  labId: LabId
  exerciseId: string
}

type UseExerciseSessionResult = {
  stage: ExerciseSessionStage
  start: () => void
  recordCompletion: (durationMs: number) => void
  recordExit: (durationMs: number) => Promise<void>
}

// Owns the intro → active → completion lifecycle shared by every exercise, and
// reports each attempt through the one shared save action. Navigation (what
// screen comes next) deliberately stays with the caller — composed sessions
// will eventually chain exercises together, which this hook shouldn't assume.
export function useExerciseSession({ labId, exerciseId }: UseExerciseSessionOptions): UseExerciseSessionResult {
  const [stage, setStage] = useState<ExerciseSessionStage>('intro')

  function start(): void {
    setStage('active')
  }

  function recordCompletion(durationMs: number): void {
    setStage('completion')
    void savePracticeSession({ labId, exerciseId, durationMs, completed: true })
  }

  // Returns a promise (unlike recordCompletion) because the caller navigates
  // away immediately on exit, with no natural delay like a completion-screen
  // button click — awaiting this avoids a real race where the lab page
  // re-fetches progress before this write has landed.
  async function recordExit(durationMs: number): Promise<void> {
    await savePracticeSession({ labId, exerciseId, durationMs, completed: false })
  }

  return { stage, start, recordCompletion, recordExit }
}
