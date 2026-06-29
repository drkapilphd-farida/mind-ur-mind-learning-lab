'use client'

import { useRef, useState } from 'react'
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
  recordCompletion: (durationMs: number) => Promise<void>
  recordExit: (durationMs: number) => Promise<void>
  awaitPendingSave: () => Promise<void>
}

// Owns the intro → active → completion lifecycle shared by every exercise, and
// reports each attempt through the one shared save action. Navigation (what
// screen comes next) deliberately stays with the caller — composed sessions
// will eventually chain exercises together, which this hook shouldn't assume.
export function useExerciseSession({ labId, exerciseId }: UseExerciseSessionOptions): UseExerciseSessionResult {
  const [stage, setStage] = useState<ExerciseSessionStage>('intro')
  // Tracks the most recent save so a caller that navigates afterward (either
  // exit, immediately, or "Continue Learning" on the completion screen) can
  // await it first. Found necessary in Sprint 2F's verification: a fast
  // click could outrace the fire-and-forget save, navigating away before the
  // write landed and silently showing stale progress on the next page.
  const pendingSaveRef = useRef<Promise<void>>(Promise.resolve())

  function start(): void {
    setStage('active')
  }

  async function recordCompletion(durationMs: number): Promise<void> {
    setStage('completion')
    const promise = savePracticeSession({ labId, exerciseId, durationMs, completed: true }).then(() => undefined)
    pendingSaveRef.current = promise
    return promise
  }

  async function recordExit(durationMs: number): Promise<void> {
    const promise = savePracticeSession({ labId, exerciseId, durationMs, completed: false }).then(() => undefined)
    pendingSaveRef.current = promise
    return promise
  }

  function awaitPendingSave(): Promise<void> {
    return pendingSaveRef.current
  }

  return { stage, start, recordCompletion, recordExit, awaitPendingSave }
}
